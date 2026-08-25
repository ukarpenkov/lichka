import React from 'react';
import type { ReactTestInstance } from 'react-test-renderer';
import { render } from '@testing-library/react-native';

import { FuturePeekOverlay } from '../FuturePeekOverlay';

jest.mock('../../../shared/config', () => {
  const actual = jest.requireActual('../../../shared/config');
  return {
    ...actual,
    useTheme: () => ({
      text: '#00ff00',
    }),
  };
});

describe('FuturePeekOverlay', () => {
  it('should show clock with right arrow and down guide when entering future', () => {
    const { getByTestId, queryByTestId } = render(
      <FuturePeekOverlay direction="enter" animatedStyle={undefined} />,
    );

    expect(getByTestId('future-peek-overlay-enter')).toBeTruthy();
    expect(getByTestId('future-peek-icons')).toBeTruthy();
    expect(getByTestId('future-peek-chevron-right')).toBeTruthy();
    expect(getByTestId('future-peek-guide-down')).toBeTruthy();
    expect(queryByTestId('future-peek-chevron-left')).toBeNull();
    expect(queryByTestId('future-peek-guide-up')).toBeNull();
  });

  it('should show up arrow above clock with left arrow when exiting future', () => {
    const { getByTestId, queryByTestId } = render(
      <FuturePeekOverlay direction="exit" animatedStyle={undefined} />,
    );

    expect(getByTestId('future-peek-overlay-exit')).toBeTruthy();
    expect(getByTestId('future-peek-guide-up')).toBeTruthy();
    expect(getByTestId('future-peek-icons')).toBeTruthy();
    expect(getByTestId('future-peek-chevron-left')).toBeTruthy();
    expect(queryByTestId('future-peek-chevron-right')).toBeNull();
    expect(queryByTestId('future-peek-guide-down')).toBeNull();
  });

  it('should place the up guide above the clock cluster on exit', () => {
    const { getByTestId } = render(
      <FuturePeekOverlay direction="exit" animatedStyle={undefined} />,
    );

    const ids: string[] = [];
    const visit = (node: ReactTestInstance) => {
      if (typeof node.props?.testID === 'string') ids.push(node.props.testID);
      for (const child of node.children) {
        if (typeof child !== 'string') visit(child);
      }
    };
    visit(getByTestId('future-peek-cluster'));

    const guideIdx = ids.indexOf('future-peek-guide-up');
    const iconsIdx = ids.indexOf('future-peek-icons');
    expect(guideIdx).toBeGreaterThanOrEqual(0);
    expect(iconsIdx).toBeGreaterThan(guideIdx);
  });
});
