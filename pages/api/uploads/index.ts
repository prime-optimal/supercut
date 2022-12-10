import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';
import { EditProps } from '../../../store/superTypes.types';
import { PostgrestResponse } from '@supabase/supabase-js';
import { client } from '../../../supabase';

const { Video } = new Mux();

const insertEdit = async ({
  id,
  uploadId,
}: {
  id: string;
  uploadId: string;
}) => {
  console.log('insertEdit uploadId', uploadId);

  const edit: EditProps = {
    id: id,
    uploadId: uploadId,
    playbackId: null,
    assetId: null,
    status: null,
    staticStatus: null,
  };

  const { data, error }: PostgrestResponse<undefined> = await client
    .from('Edit')
    .insert({ ...edit });

  console.log('insertEdit', data, error);

  return { data, error };
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const upload = await Video.Uploads.create({
          new_asset_settings: {
            playback_policy: 'public',
            mp4_support: 'standard',
          },
          cors_origin: '*',
        });

        const body = JSON.parse(req?.body);
        const uploadId: string = upload.id;
        const id: string = body?.id as string;

        console.log('uploadId', uploadId);

        await insertEdit({ uploadId, id });

        res.json({
          uploadId: upload.id,
          url: upload.url,
        });
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.json({ error: 'Error creating upload' });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
