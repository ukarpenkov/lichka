export type RootStackParamList = {
  Main: undefined;
  Alarm: { body?: string; chatTitle?: string };
};

export type ChatRoomMode = 'history' | 'future';

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: {
    chatId: string;
    messageId?: string;
    focusNonce?: number;
    mode?: ChatRoomMode;
    shareText?: string;
    shareImageUri?: string;
    shareImageWidth?: number;
    shareImageHeight?: number;
    shareNonce?: number;
  };
};

export type SettingsStackParamList = {
  Settings: undefined;
  ThemePicker: undefined;
};
