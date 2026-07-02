import React, { useId } from 'react';
import Svg, { G, Defs, ClipPath, Rect, Path, Circle } from 'react-native-svg';

export type IconProps = {
  color: string;
  size: number;
};

function useClipId(prefix: string) {
  return `${prefix}-${useId().replace(/:/g, '')}`;
}

function SvgBase({ children, size }: { children: React.ReactNode; size: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      {children}
    </Svg>
  );
}

function StrokeGroup({ color, children, clipPath }: { color: string; children: React.ReactNode; clipPath?: string }) {
  return (
    <G fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" clipPath={clipPath}>
      {children}
    </G>
  );
}

export function CalendarDaysIcon({ color, size }: IconProps) {
  const clipId = useClipId('cd');

  return (
    <SvgBase size={size}>
      <Defs>
        <ClipPath id={clipId}>
          <Rect x={4} y={5} width={16} height={16} rx={1} />
        </ClipPath>
      </Defs>
      <StrokeGroup color={color}>
        <Rect x={3} y={4} width={18} height={18} rx={2} />
      </StrokeGroup>
      <StrokeGroup color={color} clipPath={`url(#${clipId})`}>
        <Path d="M3 10h18" />
      </StrokeGroup>
      <StrokeGroup color={color}>
        <Path d="M8 2v4" />
        <Path d="M16 2v4" />
        <Path d="M8 14h.01" />
        <Path d="M12 14h.01" />
        <Path d="M16 14h.01" />
        <Path d="M8 18h.01" />
        <Path d="M12 18h.01" />
        <Path d="M16 18h.01" />
      </StrokeGroup>
    </SvgBase>
  );
}

export function AlarmClockIcon({ color, size }: IconProps) {
  return (
    <SvgBase size={size}>
      <StrokeGroup color={color}>
        <Circle cx={12} cy={13} r={8} />
        <Path d="M12 9v4l2 2" />
        <Path d="M5 3 2 6" />
        <Path d="m22 6-3-3" />
        <Path d="M6.38 18.7 4 21" />
        <Path d="M17.64 18.67 20 21" />
      </StrokeGroup>
    </SvgBase>
  );
}
