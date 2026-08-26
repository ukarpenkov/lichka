import { Linking } from 'react-native';
import {
  hasMessageLinks,
  openExternalUrl,
  parseMessageLinks,
  splitUrlTrail,
  toHttpHref,
} from '../messageLinks';

describe('toHttpHref', () => {
  it('should accept https URLs with a dotted host', () => {
    expect(toHttpHref('https://example.com/note')).toBe('https://example.com/note');
  });

  it('should prefix www hosts with https', () => {
    expect(toHttpHref('www.example.com/a')).toBe('https://www.example.com/a');
  });

  it('should accept localhost and IPv4', () => {
    expect(toHttpHref('http://localhost:3000/x')).toBe('http://localhost:3000/x');
    expect(toHttpHref('http://127.0.0.1/')).toBe('http://127.0.0.1/');
  });

  it('should reject incomplete or non-http URLs', () => {
    expect(toHttpHref('https://')).toBeNull();
    expect(toHttpHref('https://git')).toBeNull();
    expect(toHttpHref('www.')).toBeNull();
    expect(toHttpHref('javascript:alert(1)')).toBeNull();
    expect(toHttpHref('file:///tmp/a')).toBeNull();
    expect(toHttpHref('example.com')).toBeNull();
  });
});

describe('splitUrlTrail', () => {
  it('should peel trailing sentence punctuation', () => {
    expect(splitUrlTrail('https://example.com.')).toEqual({
      core: 'https://example.com',
      trail: '.',
    });
  });

  it('should keep balanced parentheses in the path', () => {
    expect(splitUrlTrail('https://en.wikipedia.org/wiki/Foo_(bar)')).toEqual({
      core: 'https://en.wikipedia.org/wiki/Foo_(bar)',
      trail: '',
    });
  });

  it('should peel an unmatched closing paren', () => {
    expect(splitUrlTrail('https://example.com)')).toEqual({
      core: 'https://example.com',
      trail: ')',
    });
  });
});

describe('parseMessageLinks', () => {
  it('should keep plain text as a single segment', () => {
    expect(parseMessageLinks('Hello world')).toEqual([
      { type: 'text', value: 'Hello world' },
    ]);
  });

  it('should treat a whole-message URL as a link without needing a trailing space', () => {
    expect(parseMessageLinks('https://example.com/note')).toEqual([
      {
        type: 'link',
        value: 'https://example.com/note',
        href: 'https://example.com/note',
      },
    ]);
  });

  it('should leave trailing punctuation outside the link', () => {
    expect(parseMessageLinks('see https://example.com.')).toEqual([
      { type: 'text', value: 'see ' },
      { type: 'link', value: 'https://example.com', href: 'https://example.com/' },
      { type: 'text', value: '.' },
    ]);
  });

  it('should find several URLs in one message', () => {
    const segs = parseMessageLinks('a https://a.co b www.b.co/c');
    const links = segs.filter((s) => s.type === 'link');
    expect(links).toEqual([
      { type: 'link', value: 'https://a.co', href: 'https://a.co/' },
      { type: 'link', value: 'www.b.co/c', href: 'https://www.b.co/c' },
    ]);
  });

  it('should not link incomplete URLs after send', () => {
    expect(parseMessageLinks('wait https:// still')).toEqual([
      { type: 'text', value: 'wait https:// still' },
    ]);
    expect(hasMessageLinks('wait https:// still')).toBe(false);
  });
});

describe('openExternalUrl', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should open http(s) URLs in the system handler', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await openExternalUrl('www.example.com');
    expect(openURL).toHaveBeenCalledWith('https://www.example.com/');
  });

  it('should refuse non-http URLs', async () => {
    await expect(openExternalUrl('javascript:alert(1)')).rejects.toThrow('unsupported-url');
  });
});
