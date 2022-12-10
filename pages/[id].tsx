import MuxPlayer from '@mux/mux-player-react';
import { useEffect, useMemo, useState } from 'react';
import { Page } from '../components/Page';
import { EditProps } from '../store/superTypes.types';
import { useSuperStore } from '../store/useSuperStore';
import { client } from '../supabase';

const useEdit = (id: string) => {
  const [error, setError] = useState<null | string>(null);
  const setEdit = useSuperStore((state) => state.setEdit);
  const getEdit = async (id: string) => {
    const { data, error } = await client
      .from('Edit')
      .select('*')
      .eq('id', id)
      .single();

    console.log('data', data);

    if (data) {
      setEdit({ edit: data });
    } else {
      setError('error');
    }
  };

  const edit: EditProps = useSuperStore((state) => state[`Edit:${id}`] ?? null);
  const playbackId = useMemo(() => {
    return edit?.playbackId;
  }, [edit]);

  useEffect(() => {
    if (edit === null && id) {
      getEdit(id);
    }
  }, [id, edit]);

  return { edit, playbackId, error };
};

const Playback: React.FC<{ id: string }> = ({ id }) => {
  const { edit, playbackId } = useEdit(id);

  return (
    <Page>
      <div className="flex h-screen max-h-screen w-screen flex-col">
        <h1 className="font-bold">id: {id}</h1>
        edit: {JSON.stringify(edit)}
        <div className="flex flex-col relative w-2/12 h-auto">
          {playbackId && (
            <MuxPlayer streamType="on-demand" playbackId={playbackId} />
          )}
        </div>
      </div>
    </Page>
  );
};

export async function getServerSideProps(ctx: any) {
  const { id } = ctx.query;

  return {
    props: { id },
  };
}

export default Playback;
