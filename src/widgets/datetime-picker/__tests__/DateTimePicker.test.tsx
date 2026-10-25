import React from 'react';
import { Modal } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { DateTimePicker } from '../DateTimePicker';

jest.mock('../../../shared/config', () => ({
  useTheme: () => ({
    text: '#000000',
    background: '#ffffff',
    colors: { muted: '#777777' },
  }),
  useLocale: () => ({
    locale: 'en',
    t: { today: 'Today', cancel: 'Cancel', done: 'Done' },
  }),
  getMonthLabels: () => Array.from({ length: 12 }, (_, index) => `M${index + 1}`),
  getFullMonthNames: () => Array.from({ length: 12 }, (_, index) => `Month ${index + 1}`),
  getWeekdayShort: () => 'Mon',
  monoWeight: () => ({ fontFamily: 'monospace' }),
}));

jest.mock('../../../shared/lib', () => ({ hapticTap: jest.fn() }));
jest.mock('../../../entities/settings', () => ({
  getSettings: () => ({ hapticEnabled: false }),
}));
jest.mock('../Bezel', () => ({ Bezel: () => null }));
jest.mock('../TimeScroller', () => ({ TimeScroller: () => null }));
jest.mock('../YearPicker', () => ({
  YearPicker: () => null,
  MIN_YEAR: 2020,
  MAX_YEAR: 2035,
}));
jest.mock('../YearGridModal', () => ({ YearGridModal: () => null }));

describe('DateTimePicker', () => {
  it('should close immediately when Android requests modal back navigation', () => {
    const onCancel = jest.fn();
    const { UNSAFE_getByType } = render(
      <DateTimePicker
        visible
        value={new Date(2026, 9, 25, 12, 30)}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    act(() => {
      UNSAFE_getByType(Modal).props.onRequestClose();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
