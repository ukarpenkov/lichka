import React from 'react';
import { Text } from './Text';
import { useTheme } from '../config';

type Props = {
  text: string;
  style: { color: string };
};

export function HighlightedBody({ text: input, style }: Props) {
  const { text } = useTheme();
  const segments = parseHighlights(input);

  return (
    <Text variant="body" style={style} numberOfLines={2}>
      {segments.map((seg, i) =>
        seg.marked ? (
          <Text
            key={i}
            style={{
              backgroundColor: text + '30',
              fontWeight: '600',
            }}>
            {seg.text}
          </Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        ),
      )}
    </Text>
  );
}

export function parseHighlights(input: string): Array<{ text: string; marked: boolean }> {
  const parts: Array<{ text: string; marked: boolean }> = [];
  const regex = /<mark>(.*?)<\/mark>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: input.slice(lastIndex, match.index),
        marked: false,
      });
    }
    parts.push({ text: match[1], marked: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    parts.push({ text: input.slice(lastIndex), marked: false });
  }

  return parts.length > 0 ? parts : [{ text: input, marked: false }];
}
