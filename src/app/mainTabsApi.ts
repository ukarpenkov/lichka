/** Императивный API главных табов.
 *
 * Нужен для навигации между корневыми табами и вложенными стеками
 * в обход стандартного bottom-tab-навигатора, который заменён на
 * кастомный SwipeablePager.
 */

export type MainTabsApi = {
  /** Переключиться на таб по индексу (0..count-1) с анимацией. */
  switchToTab: (index: number) => void;
};

let api: MainTabsApi | null = null;

let pendingChat: { chatId: string; messageId?: string } | null = null;

/** Навигация вложенного стека чатов, устанавливается из ChatListScreen. */
let chatStackNav: { navigate: (name: 'ChatRoom', params: { chatId: string; messageId?: string }) => void } | null = null;

function flushPending() {
  if (api && pendingChat && chatStackNav) {
    const p = pendingChat;
    pendingChat = null;
    api.switchToTab(0);
    chatStackNav.navigate('ChatRoom', { chatId: p.chatId, messageId: p.messageId });
  }
}

export function setMainTabsApi(next: MainTabsApi | null) {
  api = next;
  flushPending();
}

export function getMainTabsApi(): MainTabsApi | null {
  return api;
}

export function setChatStackNavigation(
  nav: { navigate: (name: 'ChatRoom', params: { chatId: string; messageId?: string }) => void } | null,
) {
  chatStackNav = nav;
  flushPending();
}

export function navigateToChat(chatId: string, messageId?: string) {
  if (api && chatStackNav) {
    api.switchToTab(0);
    chatStackNav.navigate('ChatRoom', { chatId, messageId });
  } else {
    pendingChat = { chatId, messageId };
  }
}

/** Оставлено для совместимости: вызывается из AppNavigator
 *  при готовности NavigationContainer. */
export function setNavigationReady() {
  flushPending();
}
