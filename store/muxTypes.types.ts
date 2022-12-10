export type MuxUploadUpdate = {
  type: 'video.upload.asset_created';
  request_id: null;
  object: {
    type: 'upload';
    id: string;
  };
  id: string;
  environment: { name: 'Production'; id: 'tbdajp' };
  data: {
    timeout: 3600;
    status: 'asset_created';
    new_asset_settings: { playback_policies: []; mp4_support: 'standard' };
    id: string;
    cors_origin: '*';
    asset_id: string;
  };
  created_at: string;
  attempts: [];
  accessor_source: null;
  accessor: null;
};

export type MuxAssetUpdate = {
  type:
    | 'video.asset.ready'
    | 'video.asset.created'
    | 'video.asset.errored'
    | 'video.asset.updated'
    | 'video.asset.deleted'
    | 'video.asset.static_renditions.ready'
    | 'video.asset.static_renditions.preparing'
    | 'video.asset.static_renditions.deleted'
    | 'video.asset.static_renditions.errored'
    | 'video.asset.master.ready'
    | 'video.asset.master.preparing'
    | 'video.asset.master.deleted'
    | 'video.asset.master.errored'
    | 'video.asset.track.created'
    | 'video.asset.track.ready'
    | 'video.asset.track.errored'
    | 'video.asset.track.deleted'
    | 'video.asset.warning';
  object: {
    type: 'asset';
    id: '0201p02fGKPE7MrbC269XRD7LpcHhrmbu0002';
  };
  id: '3a56ac3d-33da-4366-855b-f592d898409d';
  environment: {
    name: 'Demo pages';
    id: 'j0863n';
  };
  data: {
    upload_id: string;
    tracks: {
      type: 'video' | 'audio';
      max_width: number;
      max_height: number;
      max_frame_rate: number;
      id: string;
      duration: number;
    }[];
    playback_ids: any;
    status: 'ready' | 'waiting' | 'asset_created' | 'preparing' | 'errored';
    max_stored_resolution: 'SD' | string;
    max_stored_frame_rate: number;
    id: string;
    duration: number;
    created_at: string;
    aspect_ratio: '40:17' | string;
  };
  created_at: string;
  accessor_source: null;
  accessor: null;
  request_id: null;
};
