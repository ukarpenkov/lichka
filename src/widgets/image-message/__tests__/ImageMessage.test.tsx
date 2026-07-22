import React from 'react';
import { render } from '@testing-library/react-native';
import { ImageMessage } from '../ImageMessage';

jest.mock('../../../shared/lib/mediaPath', () => {
  const actual = jest.requireActual('../../../shared/lib/mediaPath');
  return {
    ...actual,
    resolveMediaPath: (relative: string) => `/mock/docs/${relative}`,
  };
});

beforeEach(() => {
  jest.restoreAllMocks();
});

const createMessage = (overrides: Partial<{
  type: string;
  body: string;
  payload: string;
}> = {}) => ({
  id: 'msg-1',
  chatId: 'chat-1',
  type: overrides.type ?? 'image',
  body: overrides.body ?? '',
  scheduledAt: null,
  intervalMinutes: null,
  enabled: false,
  payload: overrides.payload ?? JSON.stringify({ uri: 'media/images/1.jpg', width: 800, height: 600 }),
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('ImageMessage', () => {
  it('renders image with valid payload', () => {
    const { UNSAFE_getByType } = render(
      <ImageMessage message={createMessage()} />,
    );

    const { Image } = require('react-native');
    const image = UNSAFE_getByType(Image);
    expect(image.props.source.uri).toBe('file:///mock/docs/media/images/1.jpg');
  });

  it('renders caption when body is not empty', () => {
    const { getByText } = render(
      <ImageMessage message={createMessage({ body: 'My screenshot' })} />,
    );

    expect(getByText('My screenshot')).toBeTruthy();
  });

  it('does not render caption when body is empty', () => {
    const { queryByText } = render(
      <ImageMessage message={createMessage({ body: '' })} />,
    );

    const { Text } = require('../../../shared/ui/Text');
    expect(queryByText('[image')).toBeFalsy();
  });

  it('shows fallback text when payload is missing uri', () => {
    const { getByText } = render(
      <ImageMessage message={createMessage({
        payload: JSON.stringify({ foo: 'bar' }),
        body: '[image]',
      })} />,
    );

    expect(getByText('[image]')).toBeTruthy();
  });

  it('shows fallback text when payload is null', () => {
    const { getByText } = render(
      <ImageMessage message={createMessage({
        payload: null,
        body: '[image:800x600]',
      })} />,
    );

    expect(getByText('[image:800x600]')).toBeTruthy();
  });

  it('computes image dimensions from payload width/height', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageMessage message={createMessage({
        payload: JSON.stringify({ uri: 'media/images/2.jpg', width: 400, height: 300 }),
      })} />,
    );

    const { View } = require('react-native');
    const frame = UNSAFE_getAllByType(View).find(
      (node: { props: { style?: unknown } }) => {
        const style = node.props.style;
        if (!Array.isArray(style)) return false;
        return style.some(
          (entry) =>
            entry &&
            typeof entry === 'object' &&
            'borderRadius' in entry &&
            typeof entry.height === 'number',
        );
      },
    );
    expect(frame).toBeTruthy();
    const frameSize = (frame!.props.style as Array<Record<string, number>>).find(
      (entry) => entry && typeof entry.height === 'number',
    )!;
    expect(frameSize.height).toBeGreaterThan(0);
    expect(frameSize.height).toBeLessThanOrEqual(300);
  });

  it('keeps preview width within the content column, not full screen', () => {
    const { Dimensions } = require('react-native');
    const screenWidth = Dimensions.get('window').width;
    // gutter*2 + MessageLine time col + row gap
    const contentColumn = Math.round(screenWidth - 20 * 2 - 88 - 8);

    const { UNSAFE_getAllByType } = render(
      <ImageMessage message={createMessage()} />,
    );

    const { View } = require('react-native');
    const frame = UNSAFE_getAllByType(View).find(
      (node: { props: { style?: unknown } }) => {
        const style = node.props.style;
        if (!Array.isArray(style)) return false;
        return style.some(
          (entry) =>
            entry &&
            typeof entry === 'object' &&
            'borderRadius' in entry &&
            typeof entry.width === 'number',
        );
      },
    );
    expect(frame).toBeTruthy();
    const frameSize = (frame!.props.style as Array<Record<string, number>>).find(
      (entry) => entry && typeof entry.width === 'number',
    )!;
    expect(frameSize.width).toBe(contentColumn);
    expect(frameSize.width).toBeLessThan(screenWidth);
  });

  it('does not use bubble-era negative margins that overflow the row', () => {
    const { UNSAFE_getAllByType } = render(
      <ImageMessage message={createMessage()} />,
    );

    const { View } = require('react-native');
    const containers = UNSAFE_getAllByType(View);
    const withNegativeMargin = containers.some(
      (node: { props: { style?: { marginHorizontal?: number; marginVertical?: number } } }) => {
        const style = node.props.style;
        if (!style || Array.isArray(style)) return false;
        return style.marginHorizontal === -12 || style.marginVertical === -8;
      },
    );
    expect(withNegativeMargin).toBe(false);
  });

  it('rounds preview corners and overlays a vignette', () => {
    const { UNSAFE_getByType, UNSAFE_getAllByType } = render(
      <ImageMessage message={createMessage()} />,
    );

    const { View } = require('react-native');
    const Svg = require('react-native-svg').default;
    const frames = UNSAFE_getAllByType(View).filter(
      (node: { props: { style?: unknown } }) => {
        const style = node.props.style;
        if (!Array.isArray(style)) return false;
        return style.some(
          (entry) =>
            entry &&
            typeof entry === 'object' &&
            'borderRadius' in entry &&
            entry.borderRadius === 12,
        );
      },
    );
    expect(frames.length).toBeGreaterThan(0);
    expect(UNSAFE_getByType(Svg)).toBeTruthy();
  });

  it('bleeds the image past the clip to avoid a light hairline under the radius', () => {
    const { UNSAFE_getByType } = render(
      <ImageMessage message={createMessage()} />,
    );

    const { Image } = require('react-native');
    const image = UNSAFE_getByType(Image);
    const style = image.props.style;
    expect(style.top).toBe(-1);
    expect(style.bottom).toBe(-1);
    expect(style.left).toBe(-1);
    expect(style.right).toBe(-1);
  });
});
