import { useEffect, useMemo, useRef, useState } from "react";
import { Page } from "../components/Page";
import { useLiveEdit } from "../hooks/useLiveEdit";
import { EditProps, TranscriptionProps } from "../store/superTypes.types";
import { useSuperStore } from "../store/useSuperStore";
import { client } from "../supabase";
import MuxVideo from "@mux/mux-video-react";
import * as Icon from "react-feather";
import { Progress } from "../components/Progress";

const useEdit = (id: string) => {
  const [error, setError] = useState<null | string>(null);
  const setEdit = useSuperStore((state) => state.setEdit);
  const edit: EditProps = useSuperStore((state) => state[`Edit:${id}`] ?? null);
  const playbackId = useMemo(() => {
    return edit?.playbackId;
  }, [edit]);

  const setSubEdits = useSuperStore((state) => state.setSubEdits);
  const subEdits = useSuperStore((state) => state[`SubEdits:${id}`]);

  useEffect(() => {
    const getSubEdits = async (id: string) => {
      const { data, error } = await client
        .from("Edit")
        .select("*")
        .eq("parentId", id);

      if (data) {
        setSubEdits({ edits: data, editId: id });
      } else {
        setError("error");
      }
    };
    if (id) {
      getSubEdits(id);
    }
  }, [id]);

  useEffect(() => {
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
    if (edit === null && id) {
      getEdit(id);
    }
  }, [id, edit, setEdit]);

  return { edit, playbackId, error, subEdits };
};

const Playback: React.FC<{ id: string }> = ({ id }) => {
  const { edit, subEdits } = useEdit(id);

  useLiveEdit();

  return (
    <Page seo={{ title: "Supercut" }}>
      <div className="flex h-screen max-h-screen w-screen flex-col items-center">
        <Progress id={id} edit={edit} />
        <div className="grid w-full grid-cols-1 gap-4 px-4 pb-10 lg:w-8/12 lg:grid-cols-3 xl:w-6/12">
          {/* {JSON.stringify(subEdits)} */}
          {subEdits &&
            subEdits?.map((editId: string, index: number) => {
              return <TwitterCard key={index} editId={editId} />;
            })}
        </div>
      </div>
    </Page>
  );
};

const TwitterCard = ({ editId }: { editId: string }) => {
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

  const edit = useSuperStore((state) => state[`Edit:${editId}`]);

  const [isOpen, setIsOpen] = useState(false);
  const isGenerating = useMemo(() => {
    if (edit?.tweet === null) {
      return true;
    } else {
      return false;
    }
  }, [edit]);

  const videoReady = useMemo(() => {
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

  return {
    props: { id },
  };
}

export default Playback;
