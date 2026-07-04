import { launchImageLibrary } from 'react-native-image-picker';
import { pickAndCompressImage } from '../imageCompress';

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

const mockLaunch = launchImageLibrary as jest.Mock;

describe('imageCompress', () => {
  beforeEach(() => {
    mockLaunch.mockReset();
  });

  describe('pickAndCompressImage', () => {
    it('should call launchImageLibrary with compression parameters', () => {
      pickAndCompressImage();

      expect(mockLaunch).toHaveBeenCalledWith(
        {
          mediaType: 'photo',
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.75,
        },
        expect.any(Function),
      );
    });

    it('should return CompressedImage on success', async () => {
      const mockAsset = {
        uri: 'file:///tmp/photo.jpg',
        width: 1920,
        height: 1080,
        fileSize: 123456,
      };

      mockLaunch.mockImplementation((_opts: unknown, callback: Function) => {
        callback({ didCancel: false, errorCode: undefined, assets: [mockAsset] });
      });

      const result = await pickAndCompressImage();

      expect(result).toEqual({
        uri: 'file:///tmp/photo.jpg',
        width: 1920,
        height: 1080,
        fileSize: 123456,
      });
    });

    it('should return null when user cancels', async () => {
      mockLaunch.mockImplementation((_opts: unknown, callback: Function) => {
        callback({ didCancel: true, errorCode: undefined });
      });

      const result = await pickAndCompressImage();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockLaunch.mockImplementation((_opts: unknown, callback: Function) => {
        callback({ didCancel: false, errorCode: 'permission', errorMessage: 'Permission denied' });
      });

      const result = await pickAndCompressImage();

      expect(result).toBeNull();
    });

    it('should return null when assets array is empty', async () => {
      mockLaunch.mockImplementation((_opts: unknown, callback: Function) => {
        callback({ didCancel: false, errorCode: undefined, assets: [] });
      });

      const result = await pickAndCompressImage();

      expect(result).toBeNull();
    });

    it('should return null when asset has no uri', async () => {
      mockLaunch.mockImplementation((_opts: unknown, callback: Function) => {
        callback({ didCancel: false, errorCode: undefined, assets: [{ uri: undefined }] });
      });

      const result = await pickAndCompressImage();

      expect(result).toBeNull();
    });

    it('should handle missing width/height/fileSize with defaults', async () => {
      mockLaunch.mockImplementation((_opts: unknown, callback: Function) => {
        callback({
          didCancel: false,
          errorCode: undefined,
          assets: [{ uri: 'file:///tmp/photo.jpg' }],
        });
      });

      const result = await pickAndCompressImage();

      expect(result).toEqual({
        uri: 'file:///tmp/photo.jpg',
        width: 0,
        height: 0,
        fileSize: 0,
      });
    });
  });
});
