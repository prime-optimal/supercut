import {
  AssemblyChapterProps,
  EditProps,
  TranscriptionProps,
} from "./../../../../store/superTypes.types";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";
import { client } from "../../../../supabase";
import completion from "../../../../helpers/completion";

export const config = {
  api: {
    bodyParser: {
      limit: "10mb",
    },
  },
};

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
    const oldChapters = body?.old_record?.chapters;
    const newChapters = body?.record?.chapters;

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
        summary: chapter?.summary,
        gist: chapter?.gist,
      };

      return newEdit;
    }
  );

  const { data, error } = await client.from("Edit").insert([...newEdits]);
  console.log("insert chapters", data, error);
  console.log("newEdits", newEdits);

  return newEdits;
};
