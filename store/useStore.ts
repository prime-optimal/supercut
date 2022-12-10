import create from 'zustand';
export type SuperStoreProps = {
  value: string | null;
  setValue: ({ value }: { value: string }) => void;
  setLocalValue: ({ value }: { value: string }) => void;
};

const initState = {
  value: null,
};

const useSuperStore = create<SuperStoreProps>((set, get) => ({
  ...initState,
  setValue: ({ value }: { value: string }) => set({ value }),
  setLocalValue: ({ value }: { value: string }) =>
    setLocalValue({ value, set }),
}));

export { useSuperStore };

const setLocalValue = ({ value, set }: { value: string; set: any }) => {
  set({ value });
  localStorage.setItem('value', value);
};
