import { SuperStoreProps } from '../store/useSuperStore';
import { useEffect } from 'react';
import { useSuperStore } from '../store/useSuperStore';
import { client } from '../supabase';

const useLiveEdit = () => {
  const handleEditUpdate = useSuperStore(
    (state: SuperStoreProps) => state.handleEditUpdate
  );

  useEffect(() => {
    const channel = client
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Edit' },
        (payload: any) => {
          handleEditUpdate({
            newValue: payload?.new,
            oldValue: payload?.old,
            eventType: payload?.eventType,
          });
        }
      )
      .subscribe();
  }, []);
};

export { useLiveEdit };
