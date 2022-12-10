import { SuperStoreProps } from './../useSuperStore';
import { EditProps } from './../superTypes.types';

const handleEditUpdate = ({
  newValue,
  oldValue,
  eventType,
  set,
}: {
  newValue: EditProps | null;
  oldValue: EditProps | null;
  eventType: 'INSERT' | 'UPDATE';
  set: any;
}) => {
  if (eventType === 'INSERT') {
    return;
  } else if (eventType === 'UPDATE') {
    set((state: SuperStoreProps) => {
      const edit = newValue;

      console.log('newValue', newValue);

      return {
        ...state,
        [`Edit:${edit?.id}`]: edit,
      };
    });
  }
};

export { handleEditUpdate };
