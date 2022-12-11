import { SuperStoreProps } from "./../useSuperStore";
import { EditProps } from "./../superTypes.types";

const handleEditUpdate = ({
  newValue,
  oldValue,
  eventType,
  set,
}: {
  newValue: EditProps | null;
  oldValue: EditProps | null;
  eventType: "INSERT" | "UPDATE";
  set: any;
}) => {
  const edit = newValue;

  if (edit?.parentId) {
    set((state: SuperStoreProps) => {
      const otherSubEdits = state[`SubEdits:${edit?.parentId}`] || [];
      const newSubEdits = [...otherSubEdits, edit?.id];
      const newIds = Array.from(new Set([...newSubEdits]));

      return {
        ...state,
        [`SubEdits:${edit?.parentId}`]: newIds,
        [`Edit:${edit?.id}`]: edit,
      };
    });
  }

  if (eventType === "INSERT") {
    return;
  } else if (eventType === "UPDATE") {
    set((state: SuperStoreProps) => {
      const edit = newValue;

      return {
        ...state,
        [`Edit:${edit?.id}`]: edit,
      };
    });
  }
};

export { handleEditUpdate };
