import { EditProps } from '../superTypes.types';
import { SuperStoreProps } from './../useStore';
import { v4 as uuid } from 'uuid';
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
    const fileName = file.name;

    const edit: EditProps = {
      id: uuid(),
      uploadId: null,
    };

    set((state: SuperStoreProps) => {
      return {
        ...state,
        [`Edit:${id}`]: edit,
        [`Progress:${id}`]: 0,
      };
    });

    const { url, uploadId } = await createMuxUpload({
      id,
    });

    set((state: SuperStoreProps) => {
      return {
        ...state,
        [`Edit:${id}`]: { ...edit, uploadId: uploadId },
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

    return { id: uploadId, url };
  } catch (error) {
    // setError(`😱 Creating authenticated upload url failed: ${error}`)
  }
};

export { uploadMux };
