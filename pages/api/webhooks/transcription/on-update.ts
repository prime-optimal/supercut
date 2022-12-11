import {
  AssemblyChapterProps,
  ChapterProps,
  EditProps,
  TranscriptionProps,
} from "./../../../../store/superTypes.types";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";
import { client } from "../../../../supabase";
import completion from "../../../../helpers/completion";

const onUpdate = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body: {
      type: "UPDATE";
      table: "Transcription";
      record: TranscriptionProps;
      old_record: TranscriptionProps;
    } = req?.body;

    const editId = body?.record?.editId;

    const { data, error } = await client
      .from("Edit")
      .select("*")
      .eq("id", editId)
      .single();

    const hasParentId = data?.parentId !== null ? true : false;

    console.log("hasParentId", hasParentId);

    const oldChapters = body?.old_record?.chapters;
    const newChapters = body?.record?.chapters;

    const title = data?.title ?? null;
    const tweet = data?.tweet ?? null;
    const text = body?.record?.text ?? null;

    if ((title === null || tweet === null) && text !== null) {
      const title = await createTitle({ text: body?.record?.text });
      const tweet = await createTweet({ text: body?.record?.text });

      const { data, error } = await client
        .from("Edit")
        .update({ title, tweet })
        .eq("id", editId)
        .single();

      console.log("title and tweet", data, error);
    }

    if (oldChapters === null && newChapters !== null && hasParentId === false) {
      console.log("new chapters baby!!", body?.record?.chapters);
      const chapters = body?.record?.chapters;
      await createSubEdits({ chapters, editId: editId });
    } else {
      console.log("no new chapters");
    }

    res.send("done");
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ error: error });
  }
};

export default onUpdate;

const createSubEdits = async ({
  chapters,
  editId,
}: {
  chapters: AssemblyChapterProps[];
  editId: string;
}) => {
  const newEdits: EditProps[] = chapters.map(
    (chapter: AssemblyChapterProps) => {
      const newEdit: EditProps = {
        id: uuid(),
        parentId: editId,
        playbackId: null,
        assetId: null,
        uploadId: null,
        status: null,
        staticStatus: null,
        summaryStatus: null,
        assemblyId: null,
        start: chapter?.start,
        end: chapter?.end,
        headline: null,
        summary: null,
        gist: null,
      };

      return newEdit;
    }
  );

  const { data, error } = await client.from("Edit").insert([...newEdits]);
  console.log("insert chapters", data, error);
  console.log("newEdits", newEdits);

  return newEdits;
};

const createTweet = async ({ text }: { text: string }) => {
  const prompt = `Create a casual sensationalized and controversial 120 character summary without any hashtags of this text: ${text}`;
  const data = await completion({ prompt: prompt });
  return data?.choices[0].text;
};

const createTitle = async ({ text }: { text: string }) => {
  const prompt = `Create a clickbait, sensationalized and controversial title that's less than 30 characters from this text: ${text}`;

  const data = await completion({ prompt: prompt });
  return data?.choices[0].text;
};
