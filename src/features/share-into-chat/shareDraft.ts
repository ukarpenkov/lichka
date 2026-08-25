export type ShareDraft = {
  text?: string;
  imageUri?: string;
  imageWidth?: number;
  imageHeight?: number;
};

export type NativeShareEvent = {
  text?: string | null;
  imagePath?: string | null;
  width?: number | null;
  height?: number | null;
};

export function toFileUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }
  return `file://${path}`;
}

export function normalizeSharePayload(
  event: NativeShareEvent | null | undefined,
): ShareDraft | null {
  if (!event) return null;

  const text = typeof event.text === 'string' ? event.text.trim() : '';
  const imagePath = typeof event.imagePath === 'string' ? event.imagePath.trim() : '';
  if (!text && !imagePath) return null;

  const width =
    typeof event.width === 'number' && event.width > 0 ? event.width : undefined;
  const height =
    typeof event.height === 'number' && event.height > 0 ? event.height : undefined;

  return {
    text: text || undefined,
    imageUri: imagePath ? toFileUri(imagePath) : undefined,
    imageWidth: width,
    imageHeight: height,
  };
}
