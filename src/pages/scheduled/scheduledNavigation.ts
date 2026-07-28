/** Navigation payload when opening a scheduled row from the Scheduled tab. */
export function getScheduledChatNavigation(message: {
  chatId: string;
  id: string;
}): {
  chatId: string;
  messageId: string;
  options: { mode: 'future' };
} {
  return {
    chatId: message.chatId,
    messageId: message.id,
    options: { mode: 'future' },
  };
}
