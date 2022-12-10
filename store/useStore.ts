import create from 'zustand';
export type SuperStoreProps = {
  value: string | null;
  setValue: ({ value }: { value: string }) => void;
};

const initState = {
  value: null,
};

const useSuperStore = create<SuperStoreProps>((set, get) => ({
  ...initState,
  setValue: ({ value }: { value: string }) => set({ value }),
}));

export { useSuperStore };
