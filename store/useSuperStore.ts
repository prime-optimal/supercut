import create from 'zustand';
import { handleEditUpdate } from './functions/handleEditUpdate';
import { setEdit } from './functions/setEdit';
import { uploadMux } from './functions/uploadMux';
import { EditProps } from './superTypes.types';

export type SuperStoreProps = {
  [x: string]: any;
  value: string | null;
  setEdit: ({ edit }: { edit: EditProps | null }) => void;
  setValue: ({ value }: { value: string }) => void;
  setLocalValue: ({ value }: { value: string }) => void;
  uploadMux: ({
    file,
    id,
  }: {
    file: File;
    id: string;
  }) => Promise<{ data: { id: string; url: string } | null; error: any }>;
  handleEditUpdate: ({
    newValue,
    oldValue,
    eventType,
  }: {
    newValue: EditProps | null;
    oldValue: EditProps | null;
    eventType: 'INSERT' | 'UPDATE';
  }) => void;
};

const initState = {
  value: null,
};

const useSuperStore = create<SuperStoreProps>((set, get) => ({
  ...initState,
  setEdit: ({ edit }: { edit: EditProps | null }) => setEdit({ edit, set }),
  setValue: ({ value }: { value: string }) => set({ value }),
  setLocalValue: ({ value }: { value: string }) =>
    setLocalValue({ value, set }),
  uploadMux: ({ file, id }: { file: File; id: string }) =>
    uploadMux({ file, id, set }),
  handleEditUpdate: ({
    newValue,
    oldValue,
    eventType,
  }: {
    newValue: EditProps | null;
    oldValue: EditProps | null;
    eventType: 'INSERT' | 'UPDATE';
  }) => handleEditUpdate({ newValue, oldValue, eventType, set }),
}));

export { useSuperStore };

const setLocalValue = ({ value, set }: { value: string; set: any }) => {
  set({ value });
  localStorage.setItem('value', value);
};
