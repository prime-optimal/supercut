import { EditProps } from '../superTypes.types';
import { SuperStoreProps } from './../useSuperStore';

const setEdit = ({ set, edit }: { set: any; edit: EditProps | null }) => {
  set((state: SuperStoreProps) => {
    return {
      ...state,
      [`Edit:${edit?.id}`]: edit,
    };
  });
};

export { setEdit };