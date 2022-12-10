import { TranscriptionProps } from "./../superTypes.types";
import { EditProps } from "../superTypes.types";
import { SuperStoreProps } from "./../useSuperStore";

const setTranscription = ({
  set,
  transcription,
}: {
  set: any;
  transcription: TranscriptionProps | null;
}) => {
  console.log("transcription?.editId", transcription?.editId);

  set((state: SuperStoreProps) => {
    return {
      ...state,
      [`Transcription:${transcription?.editId}`]: transcription,
    };
  });
};

export { setTranscription };
