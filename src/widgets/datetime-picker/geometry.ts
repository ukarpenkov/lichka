/**
 * Геометрия концентрических безелей пикера.
 * Внешнее кольцо — месяцы, внутреннее — даты. Грани тонкие.
 */
export type RingGeometry = {
  center: number; // радиус центра штриха кольца
  width: number; // толщина грани
  inner: number; // внутренняя граница (для хит-теста)
  outer: number; // внешняя граница (для хит-теста)
};

export type PickerGeometry = {
  size: number;
  cx: number;
  month: RingGeometry;
  day: RingGeometry;
  /** Свободный радиус по центру под скролл времени */
  centerRadius: number;
};

const MONTH_WIDTH = 30;
const DAY_WIDTH = 26;
const EDGE_PADDING = 4;
const RING_GAP = 9;

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
    centerRadius: day.inner - 8,
  };
}
