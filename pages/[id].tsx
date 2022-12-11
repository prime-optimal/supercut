import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Page } from "../components/Page";
import { useLiveEdit } from "../hooks/useLiveEdit";
import {
  AssemblyChapterProps,
  EditProps,
  TranscriptionProps,
} from "../store/superTypes.types";
import { useSuperStore } from "../store/useSuperStore";
import { client } from "../supabase";
import MuxVideo from "@mux/mux-video-react";
import axios from "axios";
import { v4 as uuid } from "uuid";

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

    console.log("data", data);

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

  const transcription: TranscriptionProps | null = useSuperStore(
    (state) => state[`Transcription:${id}`]
  );

  const progress = useSuperStore((state) => state[`Progress:${id}`]);

  const createClip = async () => {
    const start = 5;
    const end = 10;

    const parentId = edit?.id;

    console.log("parentId", parentId);

    const newEdit: EditProps = {
      id: uuid(),
      parentId: parentId,
      start: start,
      end: end,
      uploadId: null,
      playbackId: null,
      assetId: null,
      status: null,
      staticStatus: null,
      summaryStatus: null,
      assemblyId: null,
      headline: null,
      summary: null,
      gist: null,
    };

    const { data, error } = await client.from("Edit").insert({ ...newEdit });

    console.log("data", data, error);

    const response = await axios({
      method: "post",
      url: "/api/clip",
      data: { editId: newEdit?.id, parentId: parentId, start, end },
    });

    console.log("response", response);
  };

  return (
    <Page>
      <div className="flex h-screen max-h-screen w-screen flex-col">
        <h1 className="font-bold">id: {id}</h1>
        <br />
        progress: {progress}
        <br />
        upload status: {edit?.status}
        <br />
        processing status: {edit?.staticStatus}
        <br />
        transcription status: {transcription?.status}
        <br />
        {`https://stream.mux.com/${edit?.playbackId}/high.mp4`}
        <br />
        <div className="grid grid-cols-4 gap-4">
          {subEdits &&
            subEdits.map((edit, index) => {
              return <TwitterCard key={index} edit={edit} id={edit?.id} />;
            })}
          {/* {transcription?.chapters &&
            transcription?.chapters.map(
              (chapter: AssemblyChapterProps, index: number) => {
                return (
                  <TwitterCard
                    key={index}
                    chapter={chapter}
                    playbackId={playbackId}
                  />
                );
              }
            )} */}
        </div>
      </div>
    </Page>
  );
};

const TwitterCard = ({ edit, id }: { edit: EditProps; id: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef(null);

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

    console.log("getTranscription data", data);

    if (data) {
      setTranscription({ transcription: data });
      // setEdit({ edit: data });
    } else {
      console.log("error");
    }
  };

  const transcription: TranscriptionProps = useSuperStore(
    (state) => state[`Transcription:${id}`]
  );

  useEffect(() => {
    if (id) {
      getTranscription(id);
    }
  }, [id]);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-solid border-gray-200">
      <div className="flex h-48 flex-col items-center overflow-hidden bg-black">
        {edit?.playbackId && (
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
      </div>
      <button
        className="btn-secondary"
        onClick={() => togglePlayPause({ isPlaying })}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <div className="flex flex-col p-3">
        <span className="text-md">{edit?.gist}</span>
        <span className="text-base text-gray-700">{edit?.summary}</span>
      </div>
    </div>
  );
};

export async function getServerSideProps(ctx) {
  const { id } = ctx.query;
  const password = ctx.query?.password;

  if (password === "superpass") {
    return {
      props: { id },
    };
  } else {
    return {
      redirect: {
        destination: "/password",
        permanent: false,
      },
    };
  }
}

export default Playback;
