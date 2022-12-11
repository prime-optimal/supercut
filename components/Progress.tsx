import { useEffect, useMemo } from "react";
import { EditProps, TranscriptionProps } from "../store/superTypes.types";
import { useSuperStore } from "../store/useSuperStore";
import { client } from "../supabase";
import * as Icon from "react-feather";

const useLiveTranscription = ({ editId }: { editId: string }) => {
  const setTranscription = useSuperStore((state) => state.setTranscription);

  useEffect(() => {
    const getTranscription = async ({ editId }) => {
      const { data, error } = await client
        .from("Transcription")
        .select("*")
        .eq("editId", editId)
        .single();

      if (data) {
        setTranscription({ transcription: data });
      } else {
        console.log("error");
      }
    };
    if (editId) {
      getTranscription({ editId });
    }
  }, [editId, setTranscription]);

  useEffect(() => {
    const channel = client
      .channel("schema-db-changes-transcription")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Transcription" },
        (payload: any) => {
          if (payload?.eventType === "UPDATE") {
            setTranscription({ transcription: payload?.new });
          } else if (payload?.eventType === "INSERT") {
            setTranscription({ transcription: payload?.new });
          }
        }
      )
      .subscribe();
  }, [setTranscription]);

  return {};
};

const Progress = ({ id, edit }: { id: string; edit: EditProps }) => {
  const transcription: TranscriptionProps | null = useSuperStore(
    (state) => state[`Transcription:${id}`]
  );
  const progress = useSuperStore((state) => state[`Progress:${id}`]);
  useLiveTranscription({ editId: id });

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

export { Progress };

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
