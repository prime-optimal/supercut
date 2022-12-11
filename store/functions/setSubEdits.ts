import { EditProps } from "../superTypes.types";
import { SuperStoreProps } from "../useSuperStore";

const setSubEdits = ({
  set,
  edits,
  editId,
}: {
  set: any;
  edits: EditProps[] | null;
  editId: string;
}) => {
  const norm: { [x: string]: EditProps } =
    edits &&
    edits.reduce(
      (obj, item: EditProps) =>
        Object.assign(obj, { [`Edit:${item?.id}`]: item }),
      {}
    );
  const ids: string[] = edits.map((item) => item.id);
  const newIds = Array.from(new Set([...ids]));
  set((state: SuperStoreProps) => {
    return {
      ...state,
      [`SubEdits:${editId}`]: newIds,
      ...norm,
    };
  });
};

export { setSubEdits };
