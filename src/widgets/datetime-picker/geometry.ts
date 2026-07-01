export type RingGeometry = {
  center: number;
  width: number;
  inner: number;
  outer: number;
};

export type PickerGeometry = {
  size: number;
  cx: number;
  month: RingGeometry;
  day: RingGeometry;
};

const MONTH_WIDTH = 38;
const DAY_WIDTH = 44;
const EDGE_PADDING = 4;
const RING_GAP = 10;

export function makeGeometry(size: number): PickerGeometry {
  const cx = size / 2;

  const monthCenter = cx - EDGE_PADDING - MONTH_WIDTH / 2;
  const month: RingGeometry = {
    center: monthCenter,
    width: MONTH_WIDTH,
    inner: monthCenter - MONTH_WIDTH / 2,
    outer: monthCenter + MONTH_WIDTH / 2,
  };

  const dayCenter = month.inner - RING_GAP - DAY_WIDTH / 2;
  const day: RingGeometry = {
    center: dayCenter,
    width: DAY_WIDTH,
    inner: dayCenter - DAY_WIDTH / 2,
    outer: dayCenter + DAY_WIDTH / 2,
  };

  return {
    size,
    cx,
    month,
    day,
  };
}
