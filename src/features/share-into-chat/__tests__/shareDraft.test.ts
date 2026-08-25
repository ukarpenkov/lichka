import { normalizeSharePayload, toFileUri } from '../shareDraft';

describe('toFileUri', () => {
  it('should prefix a bare filesystem path with file://', () => {
    expect(toFileUri('/data/share-inbox/a.jpg')).toBe('file:///data/share-inbox/a.jpg');
  });

  it('should leave file:// and content:// URIs unchanged', () => {
    expect(toFileUri('file:///tmp/a.jpg')).toBe('file:///tmp/a.jpg');
    expect(toFileUri('content://media/1')).toBe('content://media/1');
  });
});

describe('normalizeSharePayload', () => {
  it('should return null for empty or missing payload', () => {
    expect(normalizeSharePayload(null)).toBeNull();
    expect(normalizeSharePayload(undefined)).toBeNull();
    expect(normalizeSharePayload({})).toBeNull();
    expect(normalizeSharePayload({ text: '  ', imagePath: '' })).toBeNull();
  });

  it('should keep trimmed text for a shared link', () => {
    expect(normalizeSharePayload({ text: '  https://example.com/a  ' })).toEqual({
      text: 'https://example.com/a',
      imageUri: undefined,
      imageWidth: undefined,
      imageHeight: undefined,
    });
  });

  it('should convert a shared image path to a file URI with dimensions', () => {
    expect(
      normalizeSharePayload({
        imagePath: '/cache/share-inbox/p.jpg',
        width: 800,
        height: 600,
      }),
    ).toEqual({
      text: undefined,
      imageUri: 'file:///cache/share-inbox/p.jpg',
      imageWidth: 800,
      imageHeight: 600,
    });
  });

  it('should keep both text and image when the sender shared both', () => {
    expect(
      normalizeSharePayload({
        text: 'https://ex.com',
        imagePath: 'file:///tmp/shot.jpg',
        width: 0,
        height: -1,
      }),
    ).toEqual({
      text: 'https://ex.com',
      imageUri: 'file:///tmp/shot.jpg',
      imageWidth: undefined,
      imageHeight: undefined,
    });
  });
});
