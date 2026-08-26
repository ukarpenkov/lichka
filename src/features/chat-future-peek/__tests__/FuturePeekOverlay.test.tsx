import React from 'react';
import { StyleSheet } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { render } from '@testing-library/react-native';
import type { SharedValue } from 'react-native-reanimated';

import {
  FuturePeekOverlay,
  PEEK_ENTER_GUIDE_SPAN,
  PEEK_EXIT_GUIDE_SPAN,
} from '../FuturePeekOverlay';
import { PEEK_THRESHOLD } from '../peekGestureState';

let mockReduceMotion = false;

jest.mock('react-native-reanimated', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const AnimatedView = ({ children, style, ...rest }: any) =>
    ReactModule.createElement(View, { style, ...rest }, children);

  return {
    __esModule: true,
    default: { View: AnimatedView },
    useAnimatedStyle: (factory: () => object) => factory(),
    useReducedMotion: () => mockReduceMotion,
  };
});

jest.mock('../../../shared/config', () => {
  const actual = jest.requireActual('../../../shared/config');
  return {
    ...actual,
    useTheme: () => ({
      text: '#00ff00',
    }),
  };
});

function pullDistance(value: number): SharedValue<number> {
  return { value } as SharedValue<number>;
}

describe('FuturePeekOverlay', () => {
  beforeEach(() => {
    mockReduceMotion = false;
  });

  it('should show clock with right arrow and down guide when entering future', () => {
    const { getByTestId, queryByTestId } = render(
      <FuturePeekOverlay
        direction="enter"
        pullDistance={pullDistance(PEEK_THRESHOLD)}
        animatedStyle={undefined}
      />,
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
      <FuturePeekOverlay
        direction="exit"
        pullDistance={pullDistance(PEEK_THRESHOLD)}
        animatedStyle={undefined}
      />,
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
      <FuturePeekOverlay
        direction="exit"
        pullDistance={pullDistance(PEEK_THRESHOLD)}
        animatedStyle={undefined}
      />,
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

  it('should keep the growing guide visible while threshold icons stay hidden', () => {
    const { getByTestId } = render(
      <FuturePeekOverlay
        direction="enter"
        pullDistance={pullDistance(PEEK_THRESHOLD / 2)}
        animatedStyle={{ opacity: 0 }}
      />,
    );

    const clusterStyle = StyleSheet.flatten(
      getByTestId('future-peek-cluster').props.style,
    );
    const iconsStyle = StyleSheet.flatten(
      getByTestId('future-peek-icons-layer').props.style,
    );

    expect(clusterStyle.opacity).toBeUndefined();
    expect(iconsStyle.opacity).toBe(0);
    const guideStyle = StyleSheet.flatten(
      getByTestId('future-peek-guide-track-down').props.style,
    );
    expect(guideStyle.height).toBe(PEEK_ENTER_GUIDE_SPAN / 2);
    expect(guideStyle.opacity).toBe(1);
  });

  it('should reveal the time icons when the gesture is armed', () => {
    const { getByTestId } = render(
      <FuturePeekOverlay
        direction="exit"
        pullDistance={pullDistance(PEEK_THRESHOLD)}
        animatedStyle={{ opacity: 1 }}
      />,
    );

    const iconsStyle = StyleSheet.flatten(
      getByTestId('future-peek-icons-layer').props.style,
    );

    expect(iconsStyle.opacity).toBe(1);
    const guideStyle = StyleSheet.flatten(
      getByTestId('future-peek-guide-track-up').props.style,
    );
    expect(guideStyle.height).toBe(PEEK_EXIT_GUIDE_SPAN);
  });

  it('should show a full guide immediately when reduced motion is enabled', () => {
    mockReduceMotion = true;

    const { getByTestId } = render(
      <FuturePeekOverlay
        direction="enter"
        pullDistance={pullDistance(1)}
        animatedStyle={{ opacity: 0 }}
      />,
    );

    const guideStyle = StyleSheet.flatten(
      getByTestId('future-peek-guide-track-down').props.style,
    );
    expect(guideStyle.height).toBe(PEEK_ENTER_GUIDE_SPAN);
    expect(guideStyle.opacity).toBe(1);
  });
});
