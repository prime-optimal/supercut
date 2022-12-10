import { EditProps } from "./../store/superTypes.types";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import axios from "axios";
import { MuxAssetUpdate, MuxUploadUpdate } from "../store/muxTypes.types";
import { client } from "../supabase";
import { v4 as uuid } from "uuid";

export const updateAssetStatus = async ({
  assetId,
  status,
  playbackId,
}: {
  assetId: string;
  status: "ready" | "waiting" | "asset_created" | "preparing" | "errored";
  playbackId: string | null;
}) => {
  if (playbackId) {
    const { data, error }: PostgrestResponse<undefined> = await client
      .from("Edit")
      .update({ status: status, playbackId: playbackId })
      .match({ assetId: assetId });

    console.log("asset status update:", assetId, status, playbackId);

    return { data, error };
  } else {
    const { data, error }: PostgrestResponse<undefined> = await client
      .from("Edit")
      .update({ status: status })
      .match({ assetId: assetId });

    console.log("asset status update:", assetId, status, "no playbackId");

    return { data, error };
  }
};

export const updateAssetStaticStatus = async ({
  assetId,
  staticStatus,
}: {
  assetId: string;
  staticStatus:
    | "ready"
    | "waiting"
    | "asset_created"
    | "preparing"
    | "errored"
    | "deleted";
}) => {
  const { data, error }: PostgrestSingleResponse<EditProps> = await client
    .from("Edit")
    .update({ staticStatus: staticStatus })
    .match({ assetId })
    .select("*")
    .single();

  if (staticStatus === "ready") {
    const playbackId = data?.playbackId;
    const audioUrl = `https://stream.mux.com/${playbackId}/high.mp4`;
    const url = process.env.NEXT_PUBLIC_ENDPOINT + "/transcribe";

    const { data: transcribeData } = await axios({
      method: "post",
      url: url,
      data: { audioUrl, editId: data?.id, transcriptionId: uuid() },
    });

    console.log("start transcribeData:", transcribeData);
  }

  return { data, error };
};

const updateUploadStatus = async ({
  uploadId,
  status,
  assetId,
}: {
  uploadId: string;
  status: any;
  assetId: string | null;
}) => {
  const { data, error }: PostgrestResponse<undefined> = await client
    .from("Edit")
    .update({ status: status, assetId: assetId })
    .match({ uploadId: uploadId });

  return { data, error };
};

export const handleUploadWebhook = async (response: MuxUploadUpdate) => {
  const status = response?.data?.status;
  const uploadId = response?.object?.id;
  const assetId = response?.data?.asset_id ? response?.data?.asset_id : null;

  return await updateUploadStatus({ uploadId, status, assetId });
};

export const handleAssetWebhook = async (response: MuxAssetUpdate) => {
  const status = response?.data?.status;
  const playbackIds: { policy: "public"; id: string }[] =
    response?.data?.playback_ids;

  const playbackId =
    playbackIds && playbackIds[0] && playbackIds[0]?.id
      ? playbackIds[0]?.id
      : null;

  const type = response?.type;
  const isStatic = type.includes("static_renditions");
  const assetId = response?.object.id;

  if (isStatic) {
    return await updateAssetStaticStatus({ assetId, staticStatus: status });
  } else {
    return await updateAssetStatus({ assetId, status, playbackId });
  }
};
