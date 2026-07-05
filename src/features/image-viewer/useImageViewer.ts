import { useCallback, useState } from 'react';

export interface ImageViewerData {
  uri: string;
  width: number;
  height: number;
}

export function useImageViewer() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<ImageViewerData | null>(null);

  const open = useCallback((img: ImageViewerData) => {
    setData(img);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  return { open, close, visible, data };
}
