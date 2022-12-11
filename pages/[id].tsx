import { useEffect, useMemo, useRef, useState } from "react";
import { Page } from "../components/Page";
import { useLiveEdit } from "../hooks/useLiveEdit";
import { EditProps, TranscriptionProps } from "../store/superTypes.types";
import { useSuperStore } from "../store/useSuperStore";
import { client } from "../supabase";
import MuxVideo from "@mux/mux-video-react";
import * as Icon from "react-feather";

const useEdit = (id: string) => {
  const [error, setError] = useState<null | string>(null);
  const [subEdits, setSubEdits] = useState<null | EditProps[]>(null);
  const setEdit = useSuperStore((state) => state.setEdit);
  const getEdit = async (id: string) => {
    const { data, error } = await client
      .from("Edit")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setEdit({ edit: data });
    } else {
      setError("error");
    }
  };

  const getSubEdits = async (id: string) => {
    const { data, error } = await client
      .from("Edit")
      .select("*")
      .eq("parentId", id);

    if (data) {
      setSubEdits(data);
    } else {
      setError("error");
    }
  };

  const edit: EditProps = useSuperStore((state) => state[`Edit:${id}`] ?? null);
  const playbackId = useMemo(() => {
    return edit?.playbackId;
  }, [edit]);

  useEffect(() => {
    if (id) {
      getSubEdits(id);
    }
  }, [id]);

  useEffect(() => {
    if (edit === null && id) {
      getEdit(id);
    }
  }, [id, edit]);

  return { edit, playbackId, error, subEdits };
};

const useLiveTranscription = ({ editId }: { editId: string }) => {
  const setTranscription = useSuperStore((state) => state.setTranscription);

  const getTranscription = async ({ editId }) => {
    const { data, error } = await client
      .from("Transcription")
      .select("*")
      .eq("editId", editId)
      .single();

    console.log("getTranscription data", data);

    if (data) {
      setTranscription({ transcription: data });
      // setEdit({ edit: data });
    } else {
      console.log("error");
    }
  };

  useEffect(() => {
    if (editId) {
      getTranscription({ editId });
    }
  }, [editId]);

  useEffect(() => {
    const channel = client
      .channel("schema-db-changes-transcription")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Transcription" },
        (payload: any) => {
          console.log("payload", payload);
          console.log("payload?.eventType", payload?.eventType);

          if (payload?.eventType === "UPDATE") {
            setTranscription({ transcription: payload?.new });
          } else if (payload?.eventType === "INSERT") {
            setTranscription({ transcription: payload?.new });
          }
        }
      )
      .subscribe();
  }, []);

  return {};
};

const Playback: React.FC<{ id: string }> = ({ id }) => {
  const { edit, playbackId, subEdits } = useEdit(id);

  useLiveTranscription({ editId: id });
  useLiveEdit();

  return (
    <Page seo={{ title: "Supercut" }}>
      <div className="flex h-screen max-h-screen w-screen flex-col items-center">
        <Progress id={id} edit={edit} />

        <div className="grid w-full grid-cols-1 gap-4 px-4 pb-10 lg:w-6/12 lg:grid-cols-3">
          {subEdits &&
            subEdits.map((edit, index) => {
              return <TwitterCard key={index} edit={edit} id={edit?.id} />;
            })}
        </div>
      </div>
    </Page>
  );
};

const Progress = ({ id, edit }: { id: string; edit: EditProps }) => {
  const transcription: TranscriptionProps | null = useSuperStore(
    (state) => state[`Transcription:${id}`]
  );
  const progress = useSuperStore((state) => state[`Progress:${id}`]);

  const calcStep = ({ isComplete, prevComplete }) => {
    if (prevComplete === false) {
      return "not-started";
    } else if (isComplete) {
      return "complete";
    } else {
      return "loading";
    }
  };

  const {
    step1,
    step2,
    step3,
    step4,
  }: { [x: string]: "not-started" | "complete" | "loading" } = useMemo(() => {
    const step1 = calcStep({
      isComplete: progress == 100 || edit?.status === "ready",
      prevComplete: true,
    });

    const step2 = calcStep({
      isComplete: edit?.staticStatus === "ready",
      prevComplete: progress == 100 || edit?.status === "ready",
    });

    const step3 = calcStep({
      isComplete: transcription?.status === "completed",
      prevComplete:
        (progress == 100 || edit?.status === "ready") &&
        edit?.staticStatus === "ready",
    });

    const step4 = calcStep({
      isComplete: true,
      prevComplete:
        (progress == 100 || edit?.status === "ready") &&
        edit?.staticStatus === "ready" &&
        transcription?.status === "completed",
    });

    return { step1, step2, step3, step4 };
  }, [edit, transcription, progress]);

  return (
    <div className="my-4 flex w-full flex-col items-center px-4 lg:w-6/12">
      <div className="flex flex-col rounded-md border border-solid border-gray-200 bg-gray-50 px-4 py-3">
        {edit && (
          <div className="flex flex-row gap-2">
            <StatusRow
              label={"Upload a video"}
              status={step1}
              progress={progress}
            />
            <StatusRow label={"Process video"} status={step2} />
            <StatusRow label={"Analyze video"} status={step3} />
            <StatusRow label={"Results"} status={step4} />
          </div>
        )}
      </div>
      {step1 === "complete" && step4 !== "complete" && (
        <div className="mt-1 flex flex-col items-center gap-1">
          <span className="text-sm text-gray-700">
            Processing time takes roughly 1-2x the duration of your video.
          </span>
          <span className=" text-sm text-gray-700">
            You can copy the URL and come back to it later
          </span>
          <div className="flex flex-row items-center gap-1">
            <Icon.Link className="" width={12} />
            <span className=" text-sm text-gray-700">{`https://supercut.vercel.app/${edit?.id}`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusRow = ({
  label,
  status,
  progress = null,
}: {
  label: string;
  status: "not-started" | "loading" | "complete";
  progress?: number;
}) => {
  return (
    <div className="flex flex-row items-center gap-1">
      <div className="min-w-4 flex h-4 flex-col items-center justify-center">
        {status !== "complete" && progress !== null && (
          <span className="text-medium rounded-sm bg-gray-200 px-1 py-0.5 text-sm text-gray-700">
            {progress.toFixed(0)}%
          </span>
        )}
        {status === "loading" && progress === null && (
          <span className="animate-spin text-gray-900">
            <Icon.Loader size={13} />
          </span>
        )}
        {status === "complete" && (
          <div
            data-complete={status === "complete" ? true : false}
            className="h-1.5 w-1.5 rounded-full bg-gray-300 data-[complete=true]:bg-green-50"
          />
        )}
      </div>
      <span
        data-complete={status === "complete" ? true : false}
        data-loading={status === "loading" ? true : false}
        className="text-base text-gray-400 line-clamp-1 data-[complete=true]:text-green-50 data-[loading=true]:text-gray-900"
      >
        {label}
      </span>
    </div>
  );
};

const TwitterCard = ({ edit, id }: { edit: EditProps; id: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const togglePlayPause = ({ isPlaying }) => {
    if (isPlaying) {
      ref.current.pause();
    } else {
      ref.current.play();
    }
  };

  const setTranscription = useSuperStore((state) => state.setTranscription);

  const getTranscription = async (id: string) => {
    const { data, error } = await client
      .from("Transcription")
      .select("*")
      .eq("editId", id)
      .single();

    if (data) {
      setTranscription({ transcription: data });
    } else {
      console.log("error");
    }
  };

  useEffect(() => {
    if (id) {
      getTranscription(id);
    }
  }, [id]);

  const [isOpen, setIsOpen] = useState(false);

  const isGenerating = useMemo(() => {
    if (edit?.tweet === null) {
      return true;
    } else {
      return false;
    }
  }, [edit]);

  const videoReady = useMemo(() => {
    // return false;
    if (edit?.status === "ready") {
      return true;
    } else {
      return false;
    }
  }, [edit]);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-solid border-gray-200">
      <div
        className="relative flex h-48 flex-col items-center overflow-hidden bg-gray-200"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {videoReady && (
          <MuxVideo
            ref={ref}
            style={{ height: "100%", maxWidth: "100%" }}
            playbackId={edit?.playbackId}
            streamType="on-demand"
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            muted={false}
          />
        )}
        {videoReady === true ? (
          <div
            data-hovered={hovered}
            className="absolute top-0 left-0 flex h-full w-full items-center justify-center data-[hovered=true]:bg-black data-[hovered=true]:bg-opacity-30"
            onClick={() => togglePlayPause({ isPlaying })}
          >
            {hovered && (
              <span className="text-white">
                {isPlaying ? <Icon.Pause /> : <Icon.Play />}
              </span>
            )}
          </div>
        ) : (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-around">
            <div className="flex flex-row items-center gap-1">
              <Icon.Loader size={13} className="animate-spin" />
              <span className="text-base line-clamp-1">Generating Video</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col p-3">
        {isGenerating ? (
          <div className="flex h-10 flex-col items-center justify-around">
            <div className="flex flex-row items-center gap-1">
              <Icon.Loader size={13} className="animate-spin" />
              <span className="text-base line-clamp-1">Generating Tweet</span>
            </div>
          </div>
        ) : (
          <>
            <span className="mb-1 text-base line-clamp-1">{edit?.title}</span>
            <span
              data-expanded={isOpen}
              className="mb-1 text-sm line-clamp-2 data-[expanded=true]:line-clamp-none"
            >
              {edit?.tweet}
            </span>
            <span
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer text-sm text-gray-600 underline"
            >
              {isOpen ? "Read less" : "Read more"}
            </span>{" "}
          </>
        )}
      </div>
    </div>
  );
};

export async function getServerSideProps(ctx) {
  const { id } = ctx.query;
  // const password = ctx.query?.password;

  // if (password === "superpass") {
  return {
    props: { id },
  };
  // } else {
  //   return {
  //     redirect: {
  //       destination: "/password",
  //       permanent: false,
  //     },
  //   };
  // }
}

export default Playback;
