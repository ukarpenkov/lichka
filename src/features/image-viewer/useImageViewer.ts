import { useCallback, useState } from 'react';

export interface ImageViewerData {
  uri: string;
  width: number;
  height: number;
}

export function useImageViewer() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<ImageViewerData | null>(null);
  /** Bumps on every open so ImageViewer re-runs open even if `visible` was stuck true. */
  const [openKey, setOpenKey] = useState(0);

  const open = useCallback((img: ImageViewerData) => {
    setData(img);
    setVisible(true);
    setOpenKey((key) => key + 1);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  return { open, close, visible, data, openKey };
}
