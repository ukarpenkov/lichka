import { act, renderHook } from '@testing-library/react-native';
import { useImageViewer } from '../useImageViewer';

describe('useImageViewer', () => {
  it('opens with data and bumps openKey on every open', () => {
    const { result } = renderHook(() => useImageViewer());
    const img = { uri: 'file:///a.jpg', width: 100, height: 80 };

    expect(result.current.visible).toBe(false);
    expect(result.current.openKey).toBe(0);

    act(() => {
      result.current.open(img);
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.data).toEqual(img);
    expect(result.current.openKey).toBe(1);

    act(() => {
      result.current.close();
    });
    expect(result.current.visible).toBe(false);

    act(() => {
      result.current.open(img);
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.openKey).toBe(2);
  });

  it('bumps openKey even when already visible so reopen is not a no-op', () => {
    const { result } = renderHook(() => useImageViewer());
    const img = { uri: 'file:///a.jpg', width: 100, height: 80 };

    act(() => {
      result.current.open(img);
    });
    const keyAfterFirst = result.current.openKey;

    act(() => {
      result.current.open(img);
    });

    expect(result.current.visible).toBe(true);
    expect(result.current.openKey).toBe(keyAfterFirst + 1);
  });
});
