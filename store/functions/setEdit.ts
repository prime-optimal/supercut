import { EditProps } from "../superTypes.types";
import { SuperStoreProps } from "./../useSuperStore";

const setEdit = ({ set, edit }: { set: any; edit: EditProps | null }) => {
  if (edit?.parentId === null) {
    set((state: SuperStoreProps) => {
      return {
        ...state,
        [`Edit:${edit?.id}`]: edit,
      };
    });
  } else {
    set((state: SuperStoreProps) => {
      const otherSubEdits = state[`SubEdits:${edit?.parentId}`] || [];
      const newSubEdits = [...otherSubEdits, edit?.id];

      return {
        ...state,
        [`SubEdits:${edit?.parentId}`]: newSubEdits,
        [`Edit:${edit?.id}`]: edit,
      };
    });
  }
};

export { setEdit };
