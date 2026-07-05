export type { Message, MessageType } from './model/types';
export {
  createMessage,
  getMessagesByChatId,
  getVisibleMessagesByChatId,
  getMessageById,
  updateMessage,
  deleteMessage,
  getScheduledMessages,
  getMessagesForChatAtTime,
  disableFiredMessages,
} from './model/messageRepository';
export { searchMessages, type SearchResult } from '../../shared/db/search';
