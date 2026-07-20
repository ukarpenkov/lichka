import {
  escapeLikePattern,
  normalizeSearchText,
} from '../normalizeSearchText';

describe('normalizeSearchText', () => {
  it('lowercases Latin and Cyrillic', () => {
    expect(normalizeSearchText('Hello')).toBe('hello');
    expect(normalizeSearchText('Привет')).toBe('привет');
  });
});

describe('escapeLikePattern', () => {
  it('escapes LIKE metacharacters', () => {
    expect(escapeLikePattern('100%_done')).toBe('100\\%\\_done');
    expect(escapeLikePattern('a\\b')).toBe('a\\\\b');
  });
});
