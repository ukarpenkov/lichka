import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, TextInput, View } from 'react-native';

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  __esModule: true,
  default: { OS: 'android', select: (values: Record<string, unknown>) => values.android ?? values.default },
}));
jest.mock('react-native/Libraries/ReactNative/requireNativeComponent', () => ({
  __esModule: true, default: () => 'KeyboardInsetsProbe',
}));

import { KeyboardAwareView } from '../KeyboardAwareView';

describe('KeyboardAwareView', () => {
  it('keeps the input and its draft mounted through open, resize and close', () => {
    const mounted = jest.fn();
    const unmounted = jest.fn();
    function Composer() {
      React.useEffect(() => { mounted(); return unmounted; }, []);
      const [text, setText] = React.useState('');
      return <TextInput testID="draft" value={text} onChangeText={setText} />;
    }
    const onInset = jest.fn();
    const screen = render(
      <KeyboardAwareView keyboardGap={21} onKeyboardInsetChange={onInset}>
        <Composer />
      </KeyboardAwareView>,
    );
    fireEvent.changeText(screen.getByTestId('draft'), 'Keep my draft');
    const height = () => StyleSheet.flatten(screen.getByTestId('keyboard-inset-spacer').props.style).height;
    expect(height()).toBe(0);
    for (const [overlap, expected] of [[244, 265], [344, 365], [0, 0]]) {
      fireEvent(screen.getByTestId('keyboard-insets-probe', { includeHiddenElements: true }), 'keyboardOverlap', { nativeEvent: { overlap } });
      expect(height()).toBe(expected);
      expect(onInset).toHaveBeenLastCalledWith(expected);
      expect(screen.getByTestId('draft').props.value).toBe('Keep my draft');
    }
    expect(mounted).toHaveBeenCalledTimes(1);
    expect(unmounted).not.toHaveBeenCalled();
  });

  it('does not add a gap when the system has already resized the container', () => {
    const screen = render(<KeyboardAwareView keyboardGap={21}><View /></KeyboardAwareView>);
    fireEvent(screen.getByTestId('keyboard-insets-probe', { includeHiddenElements: true }), 'keyboardOverlap', { nativeEvent: { overlap: 0 } });
    expect(StyleSheet.flatten(screen.getByTestId('keyboard-inset-spacer').props.style).height).toBe(0);
  });

  it.each([-20, NaN, Infinity])('ignores an invalid native overlap of %s', overlap => {
    const screen = render(<KeyboardAwareView><View /></KeyboardAwareView>);
    fireEvent(screen.getByTestId('keyboard-insets-probe', { includeHiddenElements: true }), 'keyboardOverlap', { nativeEvent: { overlap } });
    expect(StyleSheet.flatten(screen.getByTestId('keyboard-inset-spacer').props.style).height).toBe(0);
  });

  it('starts a reopened modal without the previous keyboard inset', () => {
    const first = render(<KeyboardAwareView><View /></KeyboardAwareView>);
    fireEvent(first.getByTestId('keyboard-insets-probe', { includeHiddenElements: true }), 'keyboardOverlap', { nativeEvent: { overlap: 300 } });
    first.unmount();
    const second = render(<KeyboardAwareView><View /></KeyboardAwareView>);
    expect(StyleSheet.flatten(second.getByTestId('keyboard-inset-spacer').props.style).height).toBe(0);
  });
});
