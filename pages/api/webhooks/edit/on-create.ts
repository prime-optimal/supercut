import { EditProps } from "./../../../../store/superTypes.types";
import {
  AssemblyChapterProps,
  ChapterProps,
  TranscriptionProps,
} from "../../../../store/superTypes.types";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";
import { client } from "../../../../supabase";
import Mux, { InputSettings } from "@mux/mux-node";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import completion from "../../../../helpers/completion";

export const clipVideo = async ({
  editId,
  parentId,
  start,
  end,
  summary,
}: {
  editId: string;
  parentId: string;
  start: number;
  end: number;
  summary: string;
}) => {
  const { data, error }: PostgrestSingleResponse<EditProps> = await client
    .from("Edit")
    .select("*")
    .eq("id", parentId)
    .single();

  console.log("partent Edit", data, error);

  const assetId = data?.assetId;

  console.log("start", start);
  console.log("end", end);
  console.log("assetId", assetId);

  const { Video } = new Mux();

  const inputSettings: InputSettings[] = [
    {
      url: `mux://assets/${assetId}`,
      start_time: start,
      end_time: end,
    },
  ];

  const newAsset = await Video.Assets.create({
    input: inputSettings,
    playback_policy: ["public"],
    mp4_support: "standard",
  });

  const title = await createTitle({ text: summary });
  const tweet = await createTweet({ text: summary });

  if (newAsset?.id) {
    // update Edit
    const { data, error } = await client
      .from("Edit")
      .update({ assetId: newAsset?.id, parentId: parentId, title, tweet })
      .eq("id", editId)
      .single();

    console.log("edit updated", data, error);
  }

  console.log("newAsset", newAsset);

  return newAsset;
};

const onCreate = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body: {
      type: "INSERT";
      table: "Edit";
      record: EditProps;
      old_record: EditProps;
    } = req?.body;

    const parentId = body?.record?.parentId;
    const hasParentId = parentId === null ? false : true;
    console.log("parentId", parentId);
    console.log("hasParentId", hasParentId);

    const edit: EditProps = body?.record;

    if (hasParentId === true) {
      console.log("treat this like a chapter -> ");
      await clipVideo({
        parentId: body?.record?.parentId,
        start: edit?.start / 1000,
        end: edit?.end / 1000,
        editId: edit?.id,
        summary: edit?.summary,
      });
    } else {
      console.log("do-nothing");
    }

    res.send("done");
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ error: error });
  }
};

export default onCreate;

const createTweet = async ({ text }: { text: string }) => {
  try {
    const prompt = `Create a casual sensationalized and controversial 120 character summary without any hashtags of this text: ${text}`;
    const data = await completion({ prompt: prompt });
    return data?.choices[0].text;
  } catch (error) {
    return null;
  }
};

const createTitle = async ({ text }: { text: string }) => {
  try {
    const prompt = `Create a clickbait, sensationalized and controversial title that's less than 30 characters from this text: ${text}`;

    const data = await completion({ prompt: prompt });
    return data?.choices[0].text;
  } catch (error) {
    return null;
  }
};
