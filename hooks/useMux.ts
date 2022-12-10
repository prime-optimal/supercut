import { SuperStoreProps } from '../store/useSuperStore';
import { useSuperStore } from '../store/useSuperStore';
import { useCallback, useMemo } from 'react';

const useMux = ({ id }: { id: string }) => {
  const uploadMux = useSuperStore((state: SuperStoreProps) => state.uploadMux);
  async function handleUpload(files: File[]) {
    try {
      await uploadMux({
        file: files[0],
        id: id,
      });
    } catch (error) {}
  }

  const progress = useSuperStore(
    useCallback((state) => state[`Progress:${id}`], [id])
  );
  const progressPercent: number = useMemo(() => {
    return progress ? progress?.toFixed(0) : null;
  }, [progress]);

  return {
    handleUpload,
    progressPercent,
  };
};

export { useMux };
