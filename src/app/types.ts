export type RootStackParamList = {
  Main: undefined;
  Alarm: { body?: string; chatTitle?: string };
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { chatId: string; messageId?: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  ThemePicker: undefined;
};
