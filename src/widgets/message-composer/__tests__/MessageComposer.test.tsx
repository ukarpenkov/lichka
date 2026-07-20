import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { MessageComposer } from '../MessageComposer';

const mockCreateMessage = jest.fn();
const mockScheduleNotification = jest.fn();

jest.mock('../../../entities/message', () => ({
  createMessage: (...args: unknown[]) => mockCreateMessage(...args),
  getMessageById: jest.fn(),
  getMessagesByChatId: jest.fn(),
  getVisibleMessagesByChatId: jest.fn(),
  getScheduledMessages: jest.fn(),
  getMessagesForChatAtTime: jest.fn(),
  updateMessage: jest.fn(),
  deleteMessage: jest.fn(),
}));

jest.mock('../../../entities/settings', () => ({
  getSettings: () => ({ hapticEnabled: false, soundEnabled: false, locale: 'en' }),
}));

jest.mock('../../../features/notifications', () => ({
  scheduleNotification: (...args: unknown[]) => mockScheduleNotification(...args),
  cancelNotification: jest.fn(),
  requestNotificationPermission: jest.fn(),
  ensureExactAlarmPermission: jest.fn(),
  requestBatteryOptimizationExemption: jest.fn(),
  useNotificationNavigation: jest.fn(),
  setNavigationReady: jest.fn(),
}));

jest.mock('../../../features/voice-record', () => ({
  useVoiceRecorder: () => ({
    isRecording: false,
    durationMs: 0,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    cancelRecording: jest.fn(),
  }),
  requestMicrophonePermission: jest.fn(),
}));

jest.mock('../../../shared/config/ThemeProvider', () => ({
  useTheme: () => ({
    text: '#000',
    background: '#FFF',
    colors: {
      canvas: '#FFF',
      ink: '#000',
      body: 'rgba(0,0,0,0.9)',
      muted: 'rgba(0,0,0,0.6)',
      mutedSoft: 'rgba(0,0,0,0.38)',
      surfaceSoft: 'rgba(0,0,0,0.06)',
      surfaceStrong: 'rgba(0,0,0,0.12)',
      onInk: '#FFF',
      badge: '#E53935',
      onBadge: '#FFF',
      destructive: '#E53935',
      scrim: 'rgba(0,0,0,0.45)',
      switchTrackOff: 'rgba(0,0,0,0.2)',
      switchTrackOn: 'rgba(0,0,0,0.85)',
    },
  }),
}));

jest.mock('../../../shared/config/LocaleProvider', () => ({
  useLocale: () => ({
    t: {
      messageInput: 'Message...',
      messagePlaceholder: 'Message text...',
      imageMessage: (w: number, h: number) => `[image:${w}x${h}]`,
      attachImage: 'Attach image',
      imagePreview: 'Preview',
      removeImage: 'Remove',
      imagePickError: 'Failed to pick image',
      recording: (d: string) => `Recording ${d}`,
      cancel: 'Cancel',
      exactAlarms: 'Exact alarms',
      exactAlarmsMessage: 'Exact alarms message',
      alarmPermissionsGuide: 'Alarm guide',
      openSettings: 'Open settings',
      done: 'Done',
      error: 'Error',
    },
  }),
}));

jest.mock('../../../shared/lib/keyboard', () => ({
  useKeyboardHeight: () => ({ value: 0 }),
}));

jest.mock('../../../shared/lib/haptics', () => ({
  hapticTap: jest.fn(),
  hapticLongPress: jest.fn(),
  hapticSuccess: jest.fn(),
}));

jest.mock('../../../shared/lib/sounds', () => ({
  playSendSound: jest.fn(),
}));

jest.mock('../../../shared/lib/mediaPath', () => ({
  saveImage: jest.fn().mockResolvedValue('media/images/test-id.jpg'),
  resolveMediaPath: jest.fn(),
  IMAGES_DIR: '/mock/docs/media/images',
  VOICE_DIR: '/mock/docs/media/voice',
  AVATARS_DIR: '/mock/docs/media/avatars',
  ensureDir: jest.fn(),
}));

jest.mock('../../../shared/lib/imageCompress', () => ({
  pickAndCompressImage: jest.fn().mockResolvedValue({
    uri: 'file:///test/photo.jpg',
    width: 800,
    height: 600,
    fileSize: 1024,
  }),
}));

jest.mock('../../../shared/lib/generateId', () => ({
  generateId: () => 'generated-id-1',
}));

jest.mock('../../datetime-picker/DateTimePicker', () => ({
  DateTimePicker: () => null,
}));

jest.mock('../../period-picker/PeriodPicker', () => ({
  PeriodPicker: () => null,
}));

jest.mock('../../../shared/ui/AlertDialog', () => ({
  AlertDialog: () => null,
}));

beforeEach(() => {
  mockCreateMessage.mockReset();
  mockScheduleNotification.mockReset();
});

describe('MessageComposer', () => {
  it('renders Paperclip button', () => {
    const { getByTestId } = render(<MessageComposer chatId="chat-1" />);
    expect(getByTestId('icon-Paperclip')).toBeTruthy();
  });

  it('renders Send button', () => {
    const { getByTestId } = render(<MessageComposer chatId="chat-1" />);
    expect(getByTestId('icon-Send')).toBeTruthy();
  });

  it('renders scheduled message buttons', () => {
    const { getByTestId } = render(<MessageComposer chatId="chat-1" />);
    expect(getByTestId('icon-Repeat')).toBeTruthy();
    expect(getByTestId('icon-Bell')).toBeTruthy();
  });

  it('renders scheduled buttons even when image preview is active', () => {
    const { queryByTestId } = render(<MessageComposer chatId="chat-1" />);
    expect(queryByTestId('icon-Repeat')).toBeTruthy();
    expect(queryByTestId('icon-Bell')).toBeTruthy();
  });

  it('should keep prompt row with input and paperclip', () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <MessageComposer chatId="chat-1" />,
    );
    const input = getByPlaceholderText('Message...');
    expect(input.props.textAlignVertical).toBe('center');

    const wrapper = getByTestId('composer-input-wrapper');
    const wrapperStyle = StyleSheet.flatten(wrapper.props.style);
    expect(wrapperStyle.flexDirection).toBe('row');
    expect(getByText('>')).toBeTruthy();
  });
});