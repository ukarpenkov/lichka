/** Императивный API главных табов.
 *
 * Нужен для навигации между корневыми табами и вложенными стеками
 * в обход стандартного bottom-tab-навигатора, который заменён на
 * кастомный SwipeablePager.
 */

import type { ChatRoomMode } from './types';

/** Scheduled tab index in SwipeablePager (Chats=0, Scheduled=1, Settings=2). */
export const SCHEDULED_TAB_INDEX = 1;

export type MainTabsApi = {
  /** Переключиться на таб по индексу (0..count-1) с анимацией. */
  switchToTab: (index: number) => void;
};

let api: MainTabsApi | null = null;

type PendingChat = {
  chatId: string;
  messageId?: string;
  mode?: ChatRoomMode;
};

let pendingChat: PendingChat | null = null;

export type ScheduledFocusPayload = {
  messageId: string;
  focusNonce: number;
};

let pendingScheduledFocus: ScheduledFocusPayload | null = null;
type ScheduledFocusListener = (payload: ScheduledFocusPayload) => void;
let scheduledFocusListener: ScheduledFocusListener | null = null;
let pendingOpenScheduledTab = false;

/** Навигация вложенного стека чатов, устанавливается из ChatListScreen. */
type ChatRoomParams = {
  chatId: string;
  messageId?: string;
  focusNonce?: number;
  mode?: ChatRoomMode;
};

type ChatStackNav = {
  navigate: (name: 'ChatRoom', params: ChatRoomParams) => void;
  getCurrentRoute?: () => { name: string; params?: { chatId?: string; messageId?: string } } | undefined;
  setParams?: (params: ChatRoomParams) => void;
  popToTop?: () => void;
};

let chatStackNav: ChatStackNav | null = null;

function flushPending() {
  if (api && pendingChat && chatStackNav) {
    const p = pendingChat;
    pendingChat = null;
    api.switchToTab(0);
    openChatRoom(p.chatId, p.messageId, p.mode);
  }
  // Tab switch is one-shot. pendingScheduledFocus only delivers row highlight
  // and must not call switchToTab again — otherwise a later setMainTabsApi
  // (e.g. after a user swipe) snaps the pager back to Scheduled.
  if (api && pendingOpenScheduledTab) {
    pendingOpenScheduledTab = false;
    api.switchToTab(SCHEDULED_TAB_INDEX);
  }
  if (scheduledFocusListener && pendingScheduledFocus) {
    scheduledFocusListener(pendingScheduledFocus);
  }
}

function openChatRoom(chatId: string, messageId?: string, mode?: ChatRoomMode) {
  if (!chatStackNav) return;

  // focusNonce форсирует повторный scroll/highlight при повторном тапе
  // по уведомлению, когда ChatRoom уже открыт с тем же messageId.
  const params: ChatRoomParams = { chatId, messageId, focusNonce: Date.now() };
  if (mode) {
    params.mode = mode;
  }

  const current = chatStackNav.getCurrentRoute?.();
  if (
    current?.name === 'ChatRoom' &&
    current.params?.chatId === chatId &&
    chatStackNav.setParams
  ) {
    chatStackNav.setParams(params);
    return;
  }

  chatStackNav.navigate('ChatRoom', params);
}

export function setMainTabsApi(next: MainTabsApi | null) {
  api = next;
  flushPending();
}

export function getMainTabsApi(): MainTabsApi | null {
  return api;
}

export function setChatStackNavigation(nav: ChatStackNav | null) {
  chatStackNav = nav;
  flushPending();
}

/** Повторный тап по активному табу Чаты → корень стека (список чатов). */
export function popChatStackToTop() {
  chatStackNav?.popToTop?.();
}

export function navigateToChat(
  chatId: string,
  messageId?: string,
  options?: { mode?: ChatRoomMode },
) {
  const mode = options?.mode;
  if (api && chatStackNav) {
    api.switchToTab(0);
    openChatRoom(chatId, messageId, mode);
  } else {
    pendingChat = { chatId, messageId, mode };
  }
}

/** Future timeline → Scheduled tab + scroll/highlight row. */
export function navigateToScheduled(messageId: string) {
  const payload: ScheduledFocusPayload = {
    messageId,
    focusNonce: Date.now(),
  };
  pendingScheduledFocus = payload;
  if (api) {
    api.switchToTab(SCHEDULED_TAB_INDEX);
    scheduledFocusListener?.(payload);
  } else {
    pendingOpenScheduledTab = true;
  }
}

/** Widget / deep link → Scheduled tab; optional row focus. */
export function openScheduledTab(messageId?: string) {
  if (messageId) {
    navigateToScheduled(messageId);
    return;
  }
  pendingScheduledFocus = null;
  if (api) {
    api.switchToTab(SCHEDULED_TAB_INDEX);
  } else {
    pendingOpenScheduledTab = true;
  }
}

/** ScheduledScreen подписывается, чтобы скроллить/подсветить строку. */
export function setScheduledFocusListener(listener: ScheduledFocusListener | null) {
  scheduledFocusListener = listener;
  if (listener && pendingScheduledFocus) {
    listener(pendingScheduledFocus);
  }
}

export function consumeScheduledFocus(): ScheduledFocusPayload | null {
  const payload = pendingScheduledFocus;
  pendingScheduledFocus = null;
  return payload;
}

/** Оставлено для совместимости: вызывается из AppNavigator
 *  при готовности NavigationContainer. */
export function setNavigationReady() {
  flushPending();
}

/** Сброс модуля для unit-тестов. */
export function __resetMainTabsApiForTests() {
  api = null;
  chatStackNav = null;
  pendingChat = null;
  pendingScheduledFocus = null;
  scheduledFocusListener = null;
  pendingOpenScheduledTab = false;
}
