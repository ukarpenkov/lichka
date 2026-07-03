import React, { useId } from 'react';
import Svg, { G, Defs, ClipPath, Rect, Path, Circle, Line } from 'react-native-svg';

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
      <StrokeGroup color={color}>
        <Circle cx={12} cy={13} r={8} />
        <Path d="M12 9v4l2 2" />
        <Path d="M5 3 2 6" />
        <Path d="m22 6-3-3" />
      </StrokeGroup>
      <StrokeGroup color={color} clipPath={`url(#${clipId})`}>
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

export function SettingsIcon({ color, size }: IconProps) {
  const clipId = useClipId('gs');

  return (
    <SvgBase size={size}>
      <Defs>
        <ClipPath id={clipId}>
          <Path
            d="M0 0h24v24h-24z M9 9h6v6h-6z"
            fillRule="evenodd"
          />
        </ClipPath>
      </Defs>
      <StrokeGroup color={color}>
        <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      </StrokeGroup>
      <StrokeGroup color={color} clipPath={`url(#${clipId})`}>
        <Circle cx={12} cy={12} r={3} />
      </StrokeGroup>
    </SvgBase>
  );
}

export function MessageCircleIcon({ color, size }: IconProps) {
  const clipId = useClipId('mc');

  return (
    <SvgBase size={size}>
      <Defs>
        <ClipPath id={clipId}>
          <Path
            d="M0 0h24v24h-24z M1.5 5h3v3h-3z"
            fillRule="evenodd"
          />
        </ClipPath>
      </Defs>
      <StrokeGroup color={color}>
        <Path d="M7.9 20A9 9 0 1 0 3.2 6.5A9 9 0 0 1 7.9 20Z" />
      </StrokeGroup>
      <StrokeGroup color={color} clipPath={`url(#${clipId})`}>
        <Path d="M3.2 6.5L2 22" />
      </StrokeGroup>
    </SvgBase>
  );
}
