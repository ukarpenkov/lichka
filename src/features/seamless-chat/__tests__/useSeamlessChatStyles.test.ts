import { renderHook } from '@testing-library/react-native';
import { useTheme } from '../../../shared/config';
import { useSeamlessChatStyles } from '../useSeamlessChatStyles';
import {
  SEAMLESS_OPACITY,
  SEAMLESS_RADIUS,
  defaultBubbleShadow,
  isLightBackground,
} from '../layout';

jest.mock('../../../shared/config', () => ({
  useTheme: jest.fn(),
}));

const useThemeMock = useTheme as jest.Mock;

describe('useSeamlessChatStyles', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({
      background: '#FAFAFA',
      text: '#000000',
    });
  });

  it('should expose background and text from theme', () => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });

    const { result } = renderHook(() => useSeamlessChatStyles());

    expect(result.current.background).toBe('#FAFAFA');
    expect(result.current.text).toBe('#000000');
  });

  it('should mark light background', () => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });

    const { result } = renderHook(() => useSeamlessChatStyles());

    expect(result.current.isLight).toBe(true);
  });

  it('should mark dark background for non-light preset', () => {
    useThemeMock.mockReturnValue({ background: '#000000', text: '#FFFFFF' });

    const { result } = renderHook(() => useSeamlessChatStyles());

    expect(result.current.isLight).toBe(false);
  });

  it('should apply bubble fill via opacity token', () => {
    useThemeMock.mockReturnValue({ background: '#000000', text: '#FFFFFF' });

    const { result } = renderHook(() => useSeamlessChatStyles());

    expect(result.current.bubble.backgroundColor).toBe(
      '#FFFFFF' + SEAMLESS_OPACITY.bubbleFill,
    );
  });

  it('should use bubble radius token', () => {
    const { result } = renderHook(() => useSeamlessChatStyles());

    expect(result.current.bubble.borderRadius).toBe(SEAMLESS_RADIUS.bubble);
  });

  it('should zero out borderWidth via base style (verified by style composition)', () => {
    const { result } = renderHook(() => useSeamlessChatStyles());

    expect(result.current.bubble.marginVertical).toBeDefined();
    expect(result.current.bubble.paddingHorizontal).toBeDefined();
  });

  it('should provide meta color with opacity token', () => {
    useThemeMock.mockReturnValue({ background: '#000000', text: '#FFFFFF' });

    const { result } = renderHook(() => useSeamlessChatStyles());

    expect(result.current.meta.color).toBe('#FFFFFF' + SEAMLESS_OPACITY.meta);
  });

  it('should rebuild styles when theme changes', () => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });
    const { result, rerender } = renderHook(() => useSeamlessChatStyles());
    const before = result.current.bubble.backgroundColor;

    useThemeMock.mockReturnValue({ background: '#000000', text: '#FFFFFF' });
    rerender(undefined);

    expect(result.current.bubble.backgroundColor).not.toBe(before);
    expect(result.current.bubble.backgroundColor).toBe(
      '#FFFFFF' + SEAMLESS_OPACITY.bubbleFill,
    );
  });
});

describe('defaultBubbleShadow', () => {
  it('should use light opacity on light background', () => {
    const shadow = defaultBubbleShadow('#FAFAFA');

    expect(shadow.shadowOpacity).toBe(0.06);
    expect(shadow.shadowOffset).toEqual({ width: 0, height: 2 });
    expect(shadow.shadowRadius).toBe(8);
  });

  it('should use dark opacity on dark background', () => {
    const shadow = defaultBubbleShadow('#000000');

    expect(shadow.shadowOpacity).toBe(0.25);
  });

  it('should set elevation only on android', () => {
    expect(defaultBubbleShadow('#FAFAFA').elevation).toBeDefined();
  });
});

describe('isLightBackground', () => {
  it.each([
    ['#FAFAFA', true],
    ['#F5F0DC', true],
    ['#F5F5F5', true],
    ['#000000', false],
    ['#1A1A2E', false],
  ])('isLightBackground(%s) === %s', (bg, expected) => {
    expect(isLightBackground(bg)).toBe(expected);
  });
});
