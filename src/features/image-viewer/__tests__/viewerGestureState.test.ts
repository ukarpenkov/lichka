import {
  getPinchStartDismissState,
  getRelativePanTranslation,
  getSingleTapAction,
  isImageZoomed,
  shouldApplyPinchUpdate,
} from '../viewerGestureState';

describe('viewerGestureState', () => {
  it('centers the container and restores overlay before pinch zoom starts', () => {
    expect(getPinchStartDismissState()).toEqual({
      containerTranslateY: 0,
      overlayOpacity: 1,
    });
  });

  it('applies pinch zoom updates only while two fingers are on screen', () => {
    expect(shouldApplyPinchUpdate(2)).toBe(true);
    expect(shouldApplyPinchUpdate(1)).toBe(false);
    expect(shouldApplyPinchUpdate(0)).toBe(false);
  });

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
