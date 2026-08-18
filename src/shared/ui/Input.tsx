import React from 'react';
import {
  TextInput,
  type TextInputProps,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../config/ThemeProvider';
import { fonts, radii, typography } from '../config/tokens';

export type InputProps = Omit<TextInputProps, 'style'> & {
  style?: TextInputProps['style'];
};

export function Input({ placeholder, multiline, style, ...rest }: InputProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.mutedSoft}
      multiline={multiline}
      style={[
        styles.base,
        {
          color: colors.ink,
          backgroundColor: colors.canvas,
          borderColor: colors.surfaceStrong,
        },
        multiline ? styles.multiline : styles.single,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.body.fontSize,
    fontFamily: fonts.regular,
  },
  single: {
    height: 44,
    textAlignVertical: 'center',
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
});
