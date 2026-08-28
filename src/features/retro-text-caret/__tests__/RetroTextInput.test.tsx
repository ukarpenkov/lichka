import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {AccessibilityInfo, StyleSheet} from 'react-native';
import {RetroTextInput} from '..';

const inputStyle = {
  color: '#22C55E',
  fontFamily: 'JetBrainsMono-Regular',
  fontSize: 16,
  lineHeight: 24,
  paddingHorizontal: 4,
  paddingVertical: 6,
};

const line = {
  ascender: 18,
  capHeight: 12,
  descender: 4,
  height: 24,
  text: 'abc',
  width: 24,
  x: 0,
  xHeight: 8,
  y: 0,
};

const hiddenQueryOptions = {includeHiddenElements: true};

describe('RetroTextInput', () => {
  beforeEach(() => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should replace the native vertical caret with a themed horizontal caret', () => {
    const {getByTestId, queryByTestId} = render(
      <RetroTextInput
        cursorColor="#F2A900"
        cursorTestID="test-caret"
        onChangeText={jest.fn()}
        style={inputStyle}
        testID="test-input"
        value="abc"
      />,
    );
    const input = getByTestId('test-input');

    expect(input.props.caretHidden).toBe(true);
    expect(StyleSheet.flatten(input.props.style).color).toBe('#22C55E');
    expect(queryByTestId('test-caret')).toBeNull();

    fireEvent(input.parent!, 'layout', {
      nativeEvent: {layout: {height: 36, width: 120, x: 0, y: 0}},
    });
    fireEvent(input, 'focus', {nativeEvent: {}});
    fireEvent(
      getByTestId('test-caret-measurement', hiddenQueryOptions),
      'textLayout',
      {
        nativeEvent: {lines: [line]},
      },
    );

    const caretStyle = StyleSheet.flatten(
      getByTestId('test-caret', hiddenQueryOptions).props.style,
    );
    expect(caretStyle).toMatchObject({
      backgroundColor: '#F2A900',
      height: 3,
      left: 28,
      top: 27,
      width: 10,
    });
  });

  it('should hide the caret measurement layer without making typed text transparent', () => {
    const {getByTestId} = render(
      <RetroTextInput
        cursorColor="#F2A900"
        cursorTestID="test-caret"
        onChangeText={jest.fn()}
        style={inputStyle}
        testID="test-input"
        value="abc"
      />,
    );
    const input = getByTestId('test-input');

    fireEvent(input, 'focus', {nativeEvent: {}});

    const measurementStyle = StyleSheet.flatten(
      getByTestId('test-caret-measurement', hiddenQueryOptions).props.style,
    );

    expect(StyleSheet.flatten(input.props.style).color).toBe('#22C55E');
    expect(measurementStyle.opacity).toBe(0);
    expect(measurementStyle.color).toBeUndefined();
  });

  it('should hide the decorative caret while a text range is selected', () => {
    const onSelectionChange = jest.fn();
    const {getByTestId, queryByTestId} = render(
      <RetroTextInput
        cursorColor="#000"
        cursorTestID="test-caret"
        onChangeText={jest.fn()}
        onSelectionChange={onSelectionChange}
        style={inputStyle}
        testID="test-input"
        value="abc"
      />,
    );
    const input = getByTestId('test-input');

    fireEvent(input, 'focus', {nativeEvent: {}});
    fireEvent(
      getByTestId('test-caret-measurement', hiddenQueryOptions),
      'textLayout',
      {
        nativeEvent: {lines: [line]},
      },
    );
    expect(getByTestId('test-caret', hiddenQueryOptions)).toBeTruthy();

    fireEvent(input, 'selectionChange', {
      nativeEvent: {selection: {end: 2, start: 0}},
    });

    expect(queryByTestId('test-caret', hiddenQueryOptions)).toBeNull();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('should position the caret from a controlled selection', () => {
    const {getByTestId} = render(
      <RetroTextInput
        cursorColor="#000"
        onChangeText={jest.fn()}
        selection={{start: 1}}
        style={inputStyle}
        testID="test-input"
        value="abc"
      />,
    );

    fireEvent(getByTestId('test-input'), 'focus', {nativeEvent: {}});

    expect(
      getByTestId('retro-text-caret-measurement', hiddenQueryOptions).props
        .children,
    ).toBe(`a\u200B`);
  });

  it('should keep native editing and scroll callbacks intact', () => {
    const onChangeText = jest.fn();
    const onScroll = jest.fn();
    const {getByTestId} = render(
      <RetroTextInput
        cursorColor="#000"
        cursorTestID="test-caret"
        defaultValue="ab"
        onChangeText={onChangeText}
        onScroll={onScroll}
        style={inputStyle}
        testID="test-input"
      />,
    );
    const input = getByTestId('test-input');

    fireEvent(input, 'focus', {nativeEvent: {}});
    fireEvent.changeText(input, 'abcd');
    fireEvent.scroll(input, {
      nativeEvent: {contentOffset: {x: 0, y: 24}},
    });

    expect(input.props.value).toBe('abcd');
    expect(onChangeText).toHaveBeenCalledWith('abcd');
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(
      getByTestId('test-caret-measurement', hiddenQueryOptions).props.children,
    ).toBe(`abcd\u200B`);
  });

  it('should keep the caret visible while the next text layout is pending', () => {
    const {getByTestId} = render(
      <RetroTextInput
        cursorColor="#000"
        cursorTestID="test-caret"
        onChangeText={jest.fn()}
        style={inputStyle}
        testID="test-input"
        value="ab"
      />,
    );
    const input = getByTestId('test-input');

    fireEvent(input, 'focus', {nativeEvent: {}});
    fireEvent(
      getByTestId('test-caret-measurement', hiddenQueryOptions),
      'textLayout',
      {
        nativeEvent: {lines: [line]},
      },
    );
    fireEvent.changeText(input, 'abc');

    expect(getByTestId('test-caret', hiddenQueryOptions)).toBeTruthy();
  });

  it('should blink discretely and disappear after the field loses focus', () => {
    jest.useFakeTimers();
    const onBlur = jest.fn();
    const {getByTestId, queryByTestId} = render(
      <RetroTextInput
        cursorColor="#000"
        cursorTestID="test-caret"
        onBlur={onBlur}
        onChangeText={jest.fn()}
        style={inputStyle}
        testID="test-input"
        value="abc"
      />,
    );
    const input = getByTestId('test-input');

    fireEvent(input, 'focus', {nativeEvent: {}});
    fireEvent(
      getByTestId('test-caret-measurement', hiddenQueryOptions),
      'textLayout',
      {
        nativeEvent: {lines: [line]},
      },
    );
    expect(getByTestId('test-caret', hiddenQueryOptions)).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(queryByTestId('test-caret', hiddenQueryOptions)).toBeNull();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(getByTestId('test-caret', hiddenQueryOptions)).toBeTruthy();

    fireEvent(input, 'blur', {nativeEvent: {}});
    expect(queryByTestId('test-caret', hiddenQueryOptions)).toBeNull();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should wait for text layout before drawing the caret', () => {
    const {getByTestId, queryByTestId} = render(
      <RetroTextInput
        cursorColor="#000"
        cursorTestID="test-caret"
        onChangeText={jest.fn()}
        style={inputStyle}
        testID="test-input"
        value=""
      />,
    );

    fireEvent(getByTestId('test-input'), 'focus', {nativeEvent: {}});
    fireEvent(
      getByTestId('test-caret-measurement', hiddenQueryOptions),
      'textLayout',
      {
        nativeEvent: {lines: []},
      },
    );

    expect(queryByTestId('test-caret', hiddenQueryOptions)).toBeNull();
  });

  it('should keep the caret steady when Reduce Motion is enabled', async () => {
    jest.useFakeTimers();
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    const {getByTestId} = render(
      <RetroTextInput
        cursorColor="#000"
        cursorTestID="test-caret"
        onChangeText={jest.fn()}
        style={inputStyle}
        testID="test-input"
        value="abc"
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });
    fireEvent(getByTestId('test-input'), 'focus', {nativeEvent: {}});
    fireEvent(
      getByTestId('test-caret-measurement', hiddenQueryOptions),
      'textLayout',
      {
        nativeEvent: {lines: [line]},
      },
    );

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(getByTestId('test-caret', hiddenQueryOptions)).toBeTruthy();
    });
  });
});
