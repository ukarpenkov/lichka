import { saveImage, saveAvatarPng, IMAGES_DIR, AVATARS_DIR } from '../mediaPath';

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  mkdir: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(false),
  unlink: jest.fn().mockResolvedValue(undefined),
  copyFile: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

import RNFS from 'react-native-fs';

describe('mediaPath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('IMAGES_DIR', () => {
    it('should be under MEDIA_DIR', () => {
      expect(IMAGES_DIR).toBe('/mock/docs/media/images');
    });
  });

  describe('saveImage', () => {
    const sourceUri = 'file:///tmp/photo.jpg';
    const messageId = 'msg-123';

    it('should create directory and copy file', async () => {
      const result = await saveImage(sourceUri, messageId);

      expect(RNFS.mkdir).toHaveBeenCalledWith(IMAGES_DIR);
      expect(RNFS.copyFile).toHaveBeenCalledWith('/tmp/photo.jpg', `${IMAGES_DIR}/${messageId}.jpg`);
      expect(result).toBe(`media/images/${messageId}.jpg`);
    });

    it('should return relative path', async () => {
      const result = await saveImage(sourceUri, messageId);

      expect(result).toBe(`media/images/${messageId}.jpg`);
    });

    it('should overwrite existing file', async () => {
      let existsCallCount = 0;
      (RNFS.exists as jest.Mock).mockImplementation(() => {
        existsCallCount++;
        return Promise.resolve(existsCallCount === 2);
      });

      await saveImage(sourceUri, messageId);

      expect(RNFS.unlink).toHaveBeenCalledWith(`${IMAGES_DIR}/${messageId}.jpg`);
      expect(RNFS.copyFile).toHaveBeenCalled();
    });

    it('should strip file:// prefix from sourceUri', async () => {
      await saveImage('file:///storage/emulated/0/photo.jpg', messageId);

      expect(RNFS.copyFile).toHaveBeenCalledWith(
        '/storage/emulated/0/photo.jpg',
        `${IMAGES_DIR}/${messageId}.jpg`,
      );
    });
  });

  describe('saveAvatarPng', () => {
    it('should write base64 png and return relative path', async () => {
      const result = await saveAvatarPng('data:image/png;base64,AAAA', 'chat-1');

      expect(RNFS.mkdir).toHaveBeenCalledWith(AVATARS_DIR);
      expect(RNFS.writeFile).toHaveBeenCalledWith(
        `${AVATARS_DIR}/chat-1.png`,
        'AAAA',
        'base64',
      );
      expect(result).toBe('media/avatars/chat-1.png');
    });

    it('should remove legacy jpg when present', async () => {
      (RNFS.exists as jest.Mock).mockImplementation((path: string) =>
        Promise.resolve(path.endsWith('.jpg') || path.endsWith('.png')),
      );

      await saveAvatarPng('BBBB', 'chat-2');

      expect(RNFS.unlink).toHaveBeenCalledWith(`${AVATARS_DIR}/chat-2.png`);
      expect(RNFS.unlink).toHaveBeenCalledWith(`${AVATARS_DIR}/chat-2.jpg`);
    });
  });
});
