import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Checklist } from '..';

jest.mock('../../../shared/config', () => ({
  useTheme: () => ({ colors: { ink: '#000', muted: '#888' } }),
}));
jest.mock('../../../shared/ui', () => ({ Text: require('react-native').Text }));

const items = [
  { id: 'milk', text: 'Milk', checked: false },
  { id: 'soda', text: 'Soda', checked: true },
];

it('shows completion with a tick, a strike-through, and an accessible checked state', () => {
  const { getByRole, getByText, getByTestId } = render(<Checklist items={items} onToggle={jest.fn()} />);
  expect(getByRole('checkbox', { name: 'Milk' }).props.accessibilityState).toMatchObject({ checked: false });
  expect(getByRole('checkbox', { name: 'Soda' }).props.accessibilityState).toMatchObject({ checked: true });
  expect(getByText('Soda')).toHaveStyle({ textDecorationLine: 'line-through' });
  expect(getByText('Milk')).not.toHaveStyle({ textDecorationLine: 'line-through' });
  expect(getByTestId('icon-CheckboxChecked')).toBeTruthy();
});

it('toggles only the pressed item and reflects the saved state on rerender', () => {
  const onToggle = jest.fn();
  const { getByRole, rerender } = render(<Checklist items={items} onToggle={onToggle} />);
  fireEvent.press(getByRole('checkbox', { name: 'Milk' }));
  expect(onToggle).toHaveBeenCalledWith('milk');
  rerender(<Checklist items={[{ ...items[0], checked: true }, items[1]]} onToggle={onToggle} />);
  expect(getByRole('checkbox', { name: 'Milk' }).props.accessibilityState).toMatchObject({ checked: true });
  fireEvent.press(getByRole('checkbox', { name: 'Soda' }));
  expect(onToggle).toHaveBeenLastCalledWith('soda');
});

it('keeps long press available for the message context menu', () => {
  const onLongPress = jest.fn();
  const onToggle = jest.fn();
  const { getByRole } = render(<Checklist items={items} onToggle={onToggle} onLongPress={onLongPress} />);
  fireEvent(getByRole('checkbox', { name: 'Milk' }), 'longPress');
  expect(onLongPress).toHaveBeenCalledTimes(1);
  expect(onToggle).not.toHaveBeenCalled();
});

it('exposes a read-only list when no action is supplied', () => {
  const { getByRole } = render(<Checklist items={items} />);
  expect(getByRole('checkbox', { name: 'Milk' }).props.accessibilityState).toMatchObject({ disabled: true });
});
