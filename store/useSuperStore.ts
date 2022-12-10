import create from 'zustand';
import { uploadMux } from './functions/uploadMux';

export type SuperStoreProps = {
  [x: string]: any;
  value: string | null;
  setValue: ({ value }: { value: string }) => void;
  setLocalValue: ({ value }: { value: string }) => void;
  uploadMux: ({
    file,
    id,
  }: {
    file: File;
    id: string;
  }) => Promise<{ data: { id: string; url: string } | null; error: any }>;
};

const initState = {
  value: null,
};

const useSuperStore = create<SuperStoreProps>((set, get) => ({
  ...initState,
  setValue: ({ value }: { value: string }) => set({ value }),
  setLocalValue: ({ value }: { value: string }) =>
    setLocalValue({ value, set }),
  uploadMux: ({ file, id }: { file: File; id: string }) =>
    uploadMux({ file, id, set }),
}));

export { useSuperStore };

const setLocalValue = ({ value, set }: { value: string; set: any }) => {
  set({ value });
  localStorage.setItem('value', value);
};
