import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { MessageContextMenu } from '../MessageContextMenu';

jest.mock('../../../shared/config/ThemeProvider', () => ({
  useTheme: () => ({
    text: '#000000',
    background: '#FFFFFF',
    colors: {
      canvas: '#FFFFFF',
      ink: '#000000',
      body: 'rgba(0, 0, 0, 0.9)',
      muted: 'rgba(0, 0, 0, 0.6)',
      mutedSoft: 'rgba(0, 0, 0, 0.38)',
      surfaceSoft: 'rgba(0, 0, 0, 0.06)',
      surfaceStrong: 'rgba(0, 0, 0, 0.12)',
      onInk: '#FFFFFF',
      badge: '#E53935',
      onBadge: '#FFFFFF',
      destructive: '#E53935',
      scrim: 'rgba(0, 0, 0, 0.45)',
      switchTrackOff: 'rgba(0, 0, 0, 0.2)',
      switchTrackOn: 'rgba(0, 0, 0, 0.85)',
    },
  }),
}));

jest.mock('../../../shared/config/LocaleProvider', () => ({
  useLocale: () => ({
    t: {
      copy: 'Copy',
      edit: 'Edit',
      delete: 'Delete',
      stopReminder: 'Stop reminder',
      snoozeHour: 'Snooze for an hour',
      snoozeDay: 'Snooze for a day',
    },
  }),
}));

describe('MessageContextMenu', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ['Snooze for an hour', 'onSnoozeHour'],
    ['Snooze for a day', 'onSnoozeDay'],
  ] as const)('should run %s after arming and closing the menu', (label, callback) => {
    const onClose = jest.fn();
    const actions = { onSnoozeHour: jest.fn(), onSnoozeDay: jest.fn() };
    const { getByText, getAllByRole } = render(
      <MessageContextMenu visible onCopy={jest.fn()} onEdit={jest.fn()}
        onDelete={jest.fn()} onClose={onClose} {...actions} />,
    );
    expect(getAllByRole('menuitem')).toHaveLength(5);
    fireEvent.press(getByText(label));
    expect(actions[callback]).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(350));
    fireEvent.press(getByText(label));
    expect(actions[callback]).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose.mock.invocationCallOrder[0]).toBeLessThan(actions[callback].mock.invocationCallOrder[0]);
    const other = callback === 'onSnoozeHour' ? 'onSnoozeDay' : 'onSnoozeHour';
    expect(actions[other]).not.toHaveBeenCalled();
  });

  it('should stop a periodic reminder only after the menu is armed', () => {
    const onStopReminder = jest.fn();
    const onClose = jest.fn();
    const { getByText, getAllByRole } = render(
      <MessageContextMenu visible onCopy={jest.fn()} onEdit={jest.fn()}
        onDelete={jest.fn()} onClose={onClose} onStopReminder={onStopReminder} />,
    );
    expect(getAllByRole('menuitem')).toHaveLength(4);
    fireEvent.press(getByText('Stop reminder'));
    expect(onStopReminder).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(350));
    fireEvent.press(getByText('Stop reminder'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onStopReminder).toHaveBeenCalledTimes(1);
  });

  it('should render Copy above Edit and Delete when visible', () => {
    const { getByText, getAllByRole } = render(
      <MessageContextMenu
        visible
        onCopy={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(getByText('Copy')).toBeTruthy();
    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();

    const items = getAllByRole('menuitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Copy');
    expect(items[1]).toHaveTextContent('Edit');
    expect(items[2]).toHaveTextContent('Delete');
  });

  it('should ignore item presses until armed after open', () => {
    const onCopy = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <MessageContextMenu
        visible
        onCopy={onCopy}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.press(getByText('Copy'));
    expect(onCopy).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(350);
    });

    fireEvent.press(getByText('Copy'));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should ignore backdrop press until armed so long-press release does not close menu', () => {
    const onClose = jest.fn();
    const { getByRole } = render(
      <MessageContextMenu
        visible
        onCopy={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.press(getByRole('button'));
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(350);
    });

    fireEvent.press(getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onEdit after arm delay', async () => {
    const onEdit = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <MessageContextMenu
        visible
        presentationKey={1}
        onCopy={jest.fn()}
        onEdit={onEdit}
        onDelete={jest.fn()}
        onClose={onClose}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(350);
    });

    fireEvent.press(getByText('Edit'));
    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
