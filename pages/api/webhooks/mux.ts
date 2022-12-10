import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';
import { buffer } from 'micro';
import { MuxAssetUpdate, MuxUploadUpdate } from '../../../store/muxTypes.types';
import {
  handleAssetWebhook,
  handleUploadWebhook,
} from '../../../helpers/mux-webhooks';

const webhookSecret = process.env.MUX_WEBHOOK_SECRET as string;

export const config = {
  api: {
    bodyParser: false,
  },
};

const mux = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sig: any = req.headers['mux-signature'];
    const buf = await buffer(req);
    // will raise an exception if the signature is invalid
    const isValidSignature = Mux.Webhooks.verifyHeader(buf, sig, webhookSecret);
    console.log('isValidSignature', isValidSignature);
    const bodyString = buf.toString('utf8');
    const response: MuxAssetUpdate | MuxUploadUpdate = JSON.parse(bodyString);
    const objectType = response.object.type;

    if (objectType === 'asset') {
      await handleAssetWebhook(response as MuxAssetUpdate);
    } else if (objectType === 'upload') {
      await handleUploadWebhook(response as MuxUploadUpdate);
    }

    res.status(200).send({ received: true });
  } catch (error) {
    console.log('error', error);
    res.status(500).send({ error: error });
  }
};

export default mux;
