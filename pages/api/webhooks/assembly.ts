import { EditProps } from "./../../../store/superTypes.types";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { AssemblyTranscibeResponse } from "../../../store/assemblyTypes.types";
import { TranscriptionProps } from "../../../store/superTypes.types";
import { client } from "../../../supabase";

const assembly = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const transcriptionId = req?.query?.id;
    console.log("transcriptionId", transcriptionId);
    const { status, transcript_id }: { status: string; transcript_id: string } =
      req?.body;

    console.log("status", status);
    console.log("transcript_id", transcript_id);
    console.log("transcriptionId", transcriptionId);

    const { data, error } = await client
      .from("Transcription")
      .update({ status: status })
      .eq("id", transcriptionId);

    console.log("update Transcription", transcriptionId, status);
    console.log("update Transcription", data, error);
    const ASSEMBLY_AI_AUTH = process.env.ASSEMBLY_AI_AUTH;

    const { data: transcript }: { data: AssemblyTranscibeResponse } =
      await axios({
        method: "get",
        url: `https://api.assemblyai.com/v2/transcript/${transcript_id}`,
        headers: {
          authorization: ASSEMBLY_AI_AUTH,
        },
      });

    const newTranscription: Partial<TranscriptionProps> = {
      text: transcript?.text,
      words: transcript?.words,
      chapters: transcript?.chapters,
      duration: transcript?.audio_duration,
    };

    console.log("newTranscription");

    const { data: updateData, error: updateError } = await client
      .from("Transcription")
      .update({ ...newTranscription })
      .eq("id", transcriptionId);

    res.send({ updateData, updateError });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ error: error });
  }
};

export default assembly;
