import MuxPlayer from '@mux/mux-player-react';
import { useMemo } from 'react';
import { EditProps } from '../store/superTypes.types';
import { useSuperStore } from '../store/useSuperStore';

const Playback: React.FC<{ id: string }> = ({ id }) => {
  const edit: EditProps = useSuperStore((state) => state[`Edit${id}`]);
  const playbackId = useMemo(() => {
    return edit?.playbackId;
  }, [edit]);

  return (
    <>
      <div className="flex h-screen max-h-screen w-screen flex-col">
        {playbackId && (
          <MuxPlayer
            className="h-screen"
            streamType="on-demand"
            playbackId={playbackId}
          />
        )}
      </div>
    </>
  );
};

export async function getServerSideProps(ctx: any) {
  const { id } = ctx.query;

  return {
    props: { id },
  };
}

export default Playback;
