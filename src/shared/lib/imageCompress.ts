import { launchImageLibrary } from 'react-native-image-picker';

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}

export function pickAndCompressImage(): Promise<CompressedImage | null> {
  return new Promise((resolve) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.75,
      },
      (response) => {
        if (response.didCancel || response.errorCode) {
          resolve(null);
          return;
        }

        const asset = response.assets?.[0];
        if (!asset || !asset.uri) {
          resolve(null);
          return;
        }

        resolve({
          uri: asset.uri,
          width: asset.width ?? 0,
          height: asset.height ?? 0,
          fileSize: asset.fileSize ?? 0,
        });
      },
    );
  });
}
