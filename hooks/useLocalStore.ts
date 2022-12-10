import { useEffect } from 'react';
import { SuperStoreProps, useSuperStore } from '../store/useSuperStore';

const useLocalStore = () => {
  const setValue = useSuperStore((state: SuperStoreProps) => state.setValue);
  const getValue = () => {
    const value: string | null = localStorage.getItem('value');
    if (value) {
      setValue({ value });
    }
  };
  useEffect(() => {
    getValue();
  }, []);
};

export { useLocalStore };
