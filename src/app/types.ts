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
  };
};

export type SettingsStackParamList = {
  Settings: undefined;
  ThemePicker: undefined;
};
