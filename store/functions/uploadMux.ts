import { EditProps } from '../superTypes.types';
import { SuperStoreProps } from '../useSuperStore';
import * as UpChunk from '@mux/upchunk';

const createMuxUpload = async ({ id }: { id: string }) => {
  try {
    const body = JSON.stringify({ id });

    return fetch('/api/uploads', {
      method: 'POST',
      body: body,
    })
      .then((res) => {
        return res.json();
      })
      .then(({ url, uploadId }) => {
        return { url, uploadId };
      });
  } catch (e) {
    console.log('error', e);
    return Promise.reject(e);
  }
};

const uploadMux = async ({
  file,
  set,
  id,
}: {
  file: File;
  set: any;
  id: string;
}) => {
  try {
    const edit: EditProps = {
      id: id,
      uploadId: null,
      playbackId: null,
      assetId: null,
      status: null,
      staticStatus: null,
    };

    set((state: SuperStoreProps) => {
      return {
        ...state,
        [`Edit:${id}`]: edit,
        [`Progress:${id}`]: 0,
      };
    });

    console.log('start createMuxUpload');

    const { url, uploadId } = await createMuxUpload({
      id,
    });

    console.log('done createMuxUpload', url, uploadId);

    set((state: SuperStoreProps) => {
      const newEdit: EditProps = { ...edit, uploadId: uploadId };
      return {
        ...state,
        [`Edit:${id}`]: newEdit,
      };
    });

    const upload = UpChunk.createUpload({
      endpoint: url,
      file: file, // the file object with all your video file’s data
      chunkSize: 5120, // Uploads the file in ~5mb chunks
    });
    // Subscribe to events
    upload.on('error', (error: any) => {});

    upload.on('progress', (progress: { detail: any }) => {
      set((state: SuperStoreProps) => {
        return {
          ...state,
          [`Progress:${id}`]: progress?.detail,
        };
      });
    });

    upload.on('success', async (e) => {});

    return { data: { id: uploadId, url }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

export { uploadMux };
