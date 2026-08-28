import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

const BLINK_INTERVAL_MS = 500;
const CARET_WIDTH = 10;
const CARET_HEIGHT = 3;
const ZERO_WIDTH_MARKER = '\u200B';

type Selection = {
  start: number;
  end: number;
};

type CaretLayout = {
  x: number;
  y: number;
  lineHeight: number;
};

export type RetroTextInputProps = Omit<
  TextInputProps,
  'caretHidden' | 'style'
> & {
  containerStyle?: StyleProp<ViewStyle>;
  cursorColor: string;
  cursorTestID?: string;
  style?: TextInputProps['style'];
};

function clampSelection(selection: Selection, textLength: number): Selection {
  const start = Math.max(0, Math.min(selection.start, textLength));
  const end = Math.max(start, Math.min(selection.end, textLength));
  return {start, end};
}

function numericStyleValue(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}

export const RetroTextInput = forwardRef<TextInput, RetroTextInputProps>(
  function RetroTextInputComponent(
    {
      allowFontScaling,
      containerStyle,
      cursorColor,
      cursorTestID = 'retro-text-caret',
      defaultValue = '',
      maxFontSizeMultiplier,
      onBlur,
      onChangeText,
      onFocus,
      onScroll,
      onSelectionChange,
      selection: controlledSelection,
      style,
      value,
      ...rest
    },
    ref,
  ) {
    const isControlled = typeof value === 'string';
    const [uncontrolledText, setUncontrolledText] = useState(defaultValue);
    const text = isControlled ? value : uncontrolledText;
    const [focused, setFocused] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [blinkVisible, setBlinkVisible] = useState(true);
    const [internalSelection, setInternalSelection] = useState<Selection>({
      start: text.length,
      end: text.length,
    });
    const [caretLayout, setCaretLayout] = useState<CaretLayout | null>(null);
    const [scrollOffset, setScrollOffset] = useState({x: 0, y: 0});
    const [containerWidth, setContainerWidth] = useState(0);

    const inputStyle: StyleProp<TextStyle> = [
      Platform.OS === 'android' ? {includeFontPadding: false} : null,
      style,
    ];
    const flattenedStyle = StyleSheet.flatten(inputStyle) ?? {};
    const paddingLeft = numericStyleValue(
      flattenedStyle.paddingLeft ??
        flattenedStyle.paddingHorizontal ??
        flattenedStyle.padding,
    );
    const paddingRight = numericStyleValue(
      flattenedStyle.paddingRight ??
        flattenedStyle.paddingHorizontal ??
        flattenedStyle.padding,
    );
    const paddingTop = numericStyleValue(
      flattenedStyle.paddingTop ??
        flattenedStyle.paddingVertical ??
        flattenedStyle.padding,
    );

    const measurementTypography = useMemo<TextStyle>(
      () => ({
        fontFamily: flattenedStyle.fontFamily,
        fontSize: flattenedStyle.fontSize,
        fontStyle: flattenedStyle.fontStyle,
        fontVariant: flattenedStyle.fontVariant,
        fontWeight: flattenedStyle.fontWeight,
        includeFontPadding: flattenedStyle.includeFontPadding,
        letterSpacing: flattenedStyle.letterSpacing,
        lineHeight: flattenedStyle.lineHeight,
        textAlign: flattenedStyle.textAlign,
        textTransform: flattenedStyle.textTransform,
        writingDirection: flattenedStyle.writingDirection,
      }),
      [
        flattenedStyle.fontFamily,
        flattenedStyle.fontSize,
        flattenedStyle.fontStyle,
        flattenedStyle.fontVariant,
        flattenedStyle.fontWeight,
        flattenedStyle.includeFontPadding,
        flattenedStyle.letterSpacing,
        flattenedStyle.lineHeight,
        flattenedStyle.textAlign,
        flattenedStyle.textTransform,
        flattenedStyle.writingDirection,
      ],
    );

    const requestedSelection = controlledSelection
      ? {
          start: controlledSelection.start,
          end: controlledSelection.end ?? controlledSelection.start,
        }
      : internalSelection;
    const selection = clampSelection(requestedSelection, text.length);
    const hasCollapsedSelection = selection.start === selection.end;
    const measuredPrefix = text.slice(0, selection.start) + ZERO_WIDTH_MARKER;

    useEffect(() => {
      let mounted = true;

      AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
        if (mounted && enabled) {
          setReduceMotion(true);
        }
      });

      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setReduceMotion,
      );

      return () => {
        mounted = false;
        subscription.remove();
      };
    }, []);

    useEffect(() => {
      setInternalSelection(current => clampSelection(current, text.length));
    }, [text.length]);

    useEffect(() => {
      setCaretLayout(null);
    }, [containerWidth]);

    useEffect(() => {
      setBlinkVisible(true);

      if (!focused || !hasCollapsedSelection || reduceMotion) {
        return undefined;
      }

      const interval = setInterval(() => {
        setBlinkVisible(visible => !visible);
      }, BLINK_INTERVAL_MS);

      return () => clearInterval(interval);
    }, [focused, hasCollapsedSelection, reduceMotion, selection.start, text]);

    const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
      setContainerWidth(event.nativeEvent.layout.width);
    }, []);

    const handleChangeText = useCallback(
      (nextText: string) => {
        if (!isControlled) {
          setUncontrolledText(nextText);
        }

        setInternalSelection(current => {
          const nextOffset = Math.max(
            0,
            Math.min(
              nextText.length,
              current.end + nextText.length - text.length,
            ),
          );
          return {start: nextOffset, end: nextOffset};
        });
        setBlinkVisible(true);
        onChangeText?.(nextText);
      },
      [isControlled, onChangeText, text.length],
    );

    const handleSelectionChange: NonNullable<
      TextInputProps['onSelectionChange']
    > = useCallback(
      event => {
        const nextSelection = event.nativeEvent.selection;
        setInternalSelection({
          start: nextSelection.start,
          end: nextSelection.end ?? nextSelection.start,
        });
        setBlinkVisible(true);
        onSelectionChange?.(event);
      },
      [onSelectionChange],
    );

    const handleFocus: NonNullable<TextInputProps['onFocus']> = useCallback(
      event => {
        setFocused(true);
        setBlinkVisible(true);
        onFocus?.(event);
      },
      [onFocus],
    );

    const handleBlur: NonNullable<TextInputProps['onBlur']> = useCallback(
      event => {
        setFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    const handleScroll: NonNullable<TextInputProps['onScroll']> = useCallback(
      event => {
        setScrollOffset(event.nativeEvent.contentOffset);
        onScroll?.(event);
      },
      [onScroll],
    );

    const handleTextLayout: NonNullable<
      React.ComponentProps<typeof Text>['onTextLayout']
    > = useCallback(event => {
      const lines = event.nativeEvent.lines;
      const line = lines[lines.length - 1];
      if (!line) {
        return;
      }
      setCaretLayout({
        x: line.x + line.width,
        y: line.y,
        lineHeight: line.height,
      });
    }, []);

    const unclampedLeft = paddingLeft + (caretLayout?.x ?? 0) - scrollOffset.x;
    const maxLeft = Math.max(
      paddingLeft,
      containerWidth - paddingRight - CARET_WIDTH,
    );
    const caretLeft = Math.min(Math.max(paddingLeft, unclampedLeft), maxLeft);
    const caretTop =
      paddingTop +
      (caretLayout?.y ?? 0) +
      (caretLayout?.lineHeight ?? 0) -
      CARET_HEIGHT -
      scrollOffset.y;
    const showCaret =
      focused && hasCollapsedSelection && caretLayout !== null && blinkVisible;

    return (
      <View
        onLayout={handleContainerLayout}
        style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          allowFontScaling={allowFontScaling}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          {...rest}
          caretHidden
          cursorColor="transparent"
          defaultValue={undefined}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onScroll={handleScroll}
          onSelectionChange={handleSelectionChange}
          selection={controlledSelection}
          style={inputStyle}
          value={text}
        />

        {focused && hasCollapsedSelection ? (
          <Text
            accessibilityElementsHidden
            allowFontScaling={allowFontScaling}
            importantForAccessibility="no-hide-descendants"
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            onTextLayout={handleTextLayout}
            pointerEvents="none"
            style={[
              styles.measurement,
              measurementTypography,
              {
                left: paddingLeft,
                right: paddingRight,
                top: paddingTop - scrollOffset.y,
              },
            ]}
            testID={`${cursorTestID}-measurement`}>
            {measuredPrefix}
          </Text>
        ) : null}
        {showCaret ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={[
              styles.caret,
              {
                backgroundColor: cursorColor,
                left: caretLeft,
                top: caretTop,
              },
            ]}
            testID={cursorTestID}
          />
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  measurement: {
    opacity: 0,
    position: 'absolute',
  },
  caret: {
    height: CARET_HEIGHT,
    position: 'absolute',
    width: CARET_WIDTH,
  },
});
