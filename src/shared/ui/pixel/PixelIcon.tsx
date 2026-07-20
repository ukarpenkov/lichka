import React, { useMemo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { icons as pixelSet } from '@iconify-json/streamline-pixel';

export type IconProps = {
  color: string;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export type PixelIconComponent = React.ComponentType<IconProps>;

const VIEW = 32;

/** Icons missing from Streamline Pixel — same 32px grid, fillable. */
const CUSTOM: Record<string, string[]> = {
  plus: ['M14.48 6.1h3.05v8.38H25.9v3.05H17.53V25.9H14.48V17.53H6.1V14.48h8.38V6.1Z'],
  close: [
    'M6.1 4.57h3.05v3.05h3.05v3.05h2.28v3.05h3.05V10.67h3.05V7.62h3.05V4.57h3.05v3.05h-3.05v3.05h-3.05v3.05h-3.05v3.05h3.05v3.05h3.05v3.05h3.05v3.05h-3.05v-3.05h-3.05v-3.05h-3.05v-3.05h-3.05v3.05h-3.05v3.05H9.15v3.05H6.1v-3.05h3.05v-3.05h3.05v-3.05h3.05v-3.05H12.2V10.67H9.15V7.62H6.1V4.57Z',
  ],
  pause: ['M9.14 6.1h4.57V25.9H9.14V6.1Z', 'M18.29 6.1h4.57V25.9H18.29V6.1Z'],
};

function pathsFor(name: string): string[] {
  const custom = CUSTOM[name];
  if (custom) return custom;
  const icon = pixelSet.icons[name];
  if (!icon) return [];
  const out: string[] = [];
  const re = /d="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(icon.body))) out.push(m[1]);
  return out;
}

type PixelIconProps = IconProps & {
  /** Streamline Pixel icon id, or custom: plus | close | pause */
  name: string;
};

export function PixelIcon({ name, color, size, style }: PixelIconProps) {
  const paths = useMemo(() => pathsFor(name), [name]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} style={style}>
      {paths.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

export function createPixelIcon(name: string): PixelIconComponent {
  function Icon({ color, size, style }: IconProps) {
    return <PixelIcon name={name} color={color} size={size} style={style} />;
  }
  Icon.displayName = `Pixel(${name})`;
  return Icon;
}
