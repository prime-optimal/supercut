import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { AssemblyTranscibeResponse } from "../../store/assemblyTypes.types";
import { TranscriptionProps } from "../../store/superTypes.types";
import { client } from "../../supabase";

const transcribe = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const editId = req.body.editId;
    const audioUrl = req.body.audioUrl;
    const transcriptionId = req?.body?.transcriptionId;
    const url = `https://api.assemblyai.com/v2/transcript`;
    const webhook_url = `${process.env.NEXT_PUBLIC_ENDPOINT}/webhooks/assembly?id=${transcriptionId}`;
    const authorization = process.env.ASSEMBLY_AI_AUTH;

    console.log("webhook_url", webhook_url);

    const { data: transcription }: { data: AssemblyTranscibeResponse } =
      await axios({
        url,
        method: "post",
        headers: {
          authorization: authorization,
        },
        data: {
          audio_url: audioUrl,
          auto_chapters: true,
          webhook_url: webhook_url,
        },
      });

    const newTranscription: TranscriptionProps = {
      id: transcriptionId,
      editId: editId,
      assemblyId: transcription?.id,
      text: null,
      words: null,
      chapters: null,
      duration: null,
      status: "queued",
    };

    const { data, error } = await client
      .from("Transcription")
      .insert({ ...newTranscription });

    if (editId) {
      const { data, error } = await client
        .from("Edit")
        .update({ transcriptionId: transcriptionId });
      console.log("edit update: data", data, "error", error);
    }

    console.log("insert Transcription", data, error);

    res.send({ data: { data, transcription }, error });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ data: null, error: error });
  }
};

export default transcribe;
