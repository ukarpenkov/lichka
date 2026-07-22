import {
  getRelativePanTranslation,
  getSingleTapAction,
  isImageZoomed,
} from '../viewerGestureState';

describe('viewerGestureState', () => {
  it('continues pan from the pinch end without reapplying previous movement', () => {
    const translation = getRelativePanTranslation(80, 46, 42);

    expect(translation).toBe(84);
  });

  it('keeps the image stationary when pan is rebased at pinch end', () => {
    const translation = getRelativePanTranslation(80, 42, 42);

    expect(translation).toBe(80);
  });

  it('ignores a single tap while the image is zoomed', () => {
    expect(isImageZoomed(2)).toBe(true);
    expect(getSingleTapAction(2)).toBe('ignore');
  });

  it('closes the viewer on a single tap at resting scale', () => {
    expect(isImageZoomed(1)).toBe(false);
    expect(getSingleTapAction(1)).toBe('close');
  });
});
