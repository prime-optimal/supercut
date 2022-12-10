import MuxPlayer from "@mux/mux-player-react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Page } from "../components/Page";
import { EditProps, TranscriptionProps } from "../store/superTypes.types";
import { useSuperStore } from "../store/useSuperStore";
import { client } from "../supabase";
import { v4 as uuid } from "uuid";

const useEdit = (id: string) => {
  const [error, setError] = useState<null | string>(null);
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

  const edit: EditProps = useSuperStore((state) => state[`Edit:${id}`] ?? null);
  const playbackId = useMemo(() => {
    return edit?.playbackId;
  }, [edit]);

  useEffect(() => {
    if (edit === null && id) {
      getEdit(id);
    }
  }, [id, edit]);

  return { edit, playbackId, error };
};

const useTranscription = ({ editId }: { editId: string }) => {
  const [loading, setLoading] = useState(false);
  const setTranscription = useSuperStore((state) => state.setTranscription);
  const getTranscription = async () => {
    setLoading(true);
    const { data, error } = await client
      .from("Transcription")
      .select("*")
      .eq("editId", editId)
      .single();

    if (data) {
      console.log("getTranscription", data, error);
      setTranscription({ transcription: data });
    }

    setLoading(false);
  };

  useEffect(() => {
    getTranscription();
  }, [editId]);

  return { getTranscription };
};

const Playback: React.FC<{ id: string }> = ({ id }) => {
  const { edit, playbackId } = useEdit(id);

  const transcribe = async () => {
    const audioUrl = `https://stream.mux.com/${playbackId}/high.mp4`;
    const { data } = await axios({
      method: "post",
      url: "/api/transcribe",
      data: { audioUrl, editId: id, transcriptionId: uuid() },
    });
    console.log("data", data);
  };

  const { getTranscription } = useTranscription({ editId: id });

  const transcription: TranscriptionProps | null = useSuperStore(
    (state) => state[`Transcription:${id}`]
  );

  return (
    <Page>
      <div className="flex h-screen max-h-screen w-screen flex-col">
        <h1 className="font-bold">id: {id}</h1>
        edit: {JSON.stringify(edit)}
        <div>
          <button className="btn-secondary" onClick={transcribe}>
            transcribe
          </button>
        </div>
        <button onClick={getTranscription}>Get Transcription</button>
        <br />
        transcription: {JSON.stringify(transcription)}
        <br />
        <div className="relative flex h-auto w-2/12 flex-col">
          {playbackId && edit?.status === "ready" && (
            <MuxPlayer streamType="on-demand" playbackId={playbackId} />
          )}
        </div>
      </div>
    </Page>
  );
};

export async function getServerSideProps(ctx) {
  const { id } = ctx.query;
  const password = ctx.query?.password;

  console.log("id", id);

  console.log("password", password);

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

// export async function getServerSideProps(ctx: any) {
//   const { id } = ctx.query;

//   return {
//     props: { id },
//   };
// }

export default Playback;
