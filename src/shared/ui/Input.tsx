import React from 'react';
import {
  TextInput,
  type TextInputProps,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../config';

export type InputProps = Omit<TextInputProps, 'style'> & {
  style?: TextInputProps['style'];
};

export function Input({ placeholder, multiline, style, ...rest }: InputProps) {
  const { text, background } = useTheme();

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={`${text}66`}
      multiline={multiline}
      style={[
        styles.base,
        {
          color: text,
          backgroundColor: background,
          borderColor: `${text}33`,
          height: multiline ? 100 : 44,
          textAlignVertical: multiline ? 'top' : 'center',
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});
