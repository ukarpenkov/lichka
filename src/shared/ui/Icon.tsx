import React, { useId } from 'react';
import Svg, { G, Defs, ClipPath, Path, Circle, Line } from 'react-native-svg';

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

function StrokeGroup({ color, children, clipPath, strokeWidth = 2 }: {
  color: string;
  children: React.ReactNode;
  clipPath?: string;
  strokeWidth?: number;
}) {
  return (
    <G fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" clipPath={clipPath}>
      {children}
    </G>
  );
}

export function AlarmClockIcon({ color, size }: IconProps) {
  const clipId = useClipId('ac');

  return (
    <SvgBase size={size}>
      <Defs>
        <ClipPath id={clipId}>
          <Path
            d="M0 0h24v24h-24z M5 17h3v3h-3z M16 17h3v3h-3z"
            fillRule="evenodd"
          />
        </ClipPath>
      </Defs>
      <StrokeGroup color={color} strokeWidth={1.5}>
        <Circle cx={12} cy={13} r={8} />
        <Path d="M12 9v4l2.5 1.5" />
        <Path d="M5 3 2 6" />
        <Path d="m22 6-3-3" />
      </StrokeGroup>
      <StrokeGroup color={color} strokeWidth={1.5} clipPath={`url(#${clipId})`}>
        <Path d="M6.38 18.7 4 21" />
        <Path d="M17.64 18.67 20 21" />
      </StrokeGroup>
    </SvgBase>
  );
}

export function MicIcon({ color, size }: IconProps) {
  const clipId = useClipId('mic');

  return (
    <SvgBase size={size}>
      <Defs>
        <ClipPath id={clipId}>
          <Path
            d="M0 0h24v24h-24z M8 10.5h8v3h-8z"
            fillRule="evenodd"
          />
        </ClipPath>
      </Defs>
      <StrokeGroup color={color}>
        <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <Line x1={12} x2={12} y1={19} y2={22} />
      </StrokeGroup>
      <StrokeGroup color={color} clipPath={`url(#${clipId})`}>
        <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      </StrokeGroup>
    </SvgBase>
  );
}


