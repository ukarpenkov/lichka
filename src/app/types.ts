export type RootStackParamList = {
  Main: undefined;
  Alarm: { body?: string; chatTitle?: string };
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { chatId: string; messageId?: string; focusNonce?: number };
};

export type SettingsStackParamList = {
  Settings: undefined;
  ThemePicker: undefined;
};
