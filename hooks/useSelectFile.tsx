const useFileSelect = ({
  onSelect,
  options,
}: {
  options?: {
    multiple?: boolean;
    accepts?: 'video/mp4' | 'image/*' | 'audio/*';
  };
  onSelect: (files: File[]) => void;
}) => {
  const selectFile = () => {
    const fileInput: any = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = options?.accepts;
    fileInput.click();
    fileInput.addEventListener('change', (e: any) => {
      const files: File[] = Array.from(fileInput.files);
      onSelect(files);
    });
  };

  return { selectFile };
};

export { useFileSelect };
