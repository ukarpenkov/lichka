export type { Message, MessageType } from './model/types';
export {
  createMessage,
  getMessagesByChatId,
  getVisibleMessagesByChatId,
  getMessageById,
  updateMessage,
  deleteMessage,
  getScheduledMessages,
  getScheduledMessagesByChatId,
  getMessagesForChatAtTime,
  disableFiredMessages,
  getPeriodicDisplayMessages,
  finishPeriodicMessage,
  isPeriodicDisplayId,
  extractTemplateId,
  getUnreadCounts,
  markChatAsRead,
  getAllReadMarkers,
} from './model/messageRepository';
export { searchMessages, type SearchResult } from '../../shared/db/search';
