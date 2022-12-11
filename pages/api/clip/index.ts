import { NextApiRequest, NextApiResponse } from "next";
import Mux from "@mux/mux-node";
import { EditProps } from "../../../store/superTypes.types";
import { PostgrestResponse } from "@supabase/supabase-js";
import { client } from "../../../supabase";
import { clipVideo } from "../webhooks/edit/on-create";

// const { Video } = new Mux();

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const editId = req?.body?.editId;
        const parentId = req?.body?.parentId;

        console.log("parentId", parentId);
        console.log("editId", editId);

        const foo = await clipVideo({ start: 5, end: 20, editId, parentId });

        console.log("foo", foo);
      } catch (e) {
        res.statusCode = 500;
        console.error("Request error", e); // eslint-disable-line no-console
        res.json({ error: "Error creating upload" });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
