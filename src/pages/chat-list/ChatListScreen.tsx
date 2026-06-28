import React, { useState, useCallback } from 'react';
import { FlatList, Alert, View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Search } from 'lucide-react-native';

import { Screen, Text, IconButton, AnimatedPressable } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';
import { getChats, deleteChat, type Chat } from '../../entities/chat';
import type { ChatStackParamList } from '../../app/types';
import { ChatForm } from '../../widgets/chat-form';

import { ChatListItem } from './ChatListItem';
import { ChatContextMenu } from './ChatContextMenu';
import { GlobalSearch } from './GlobalSearch';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

export function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const { text, background } = useTheme();
  const { t } = useLocale();
  const [chats, setChats] = useState<Chat[]>([]);
  const [menuChat, setMenuChat] = useState<Chat | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editChat, setEditChat] = useState<Chat | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setChats(getChats());
    }, []),
  );

  const refresh = useCallback(() => {
    setChats(getChats());
  }, []);

  const handleDelete = useCallback(() => {
    if (!menuChat) return;
    Alert.alert(t.deleteChat, t.deleteChatConfirm(menuChat.title), [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => {
          deleteChat(menuChat.id);
          setChats(getChats());
        },
      },
    ]);
  }, [menuChat, t]);

  const handleEdit = useCallback(() => {
    if (!menuChat) return;
    setEditChat(menuChat);
    setFormVisible(true);
  }, [menuChat]);

  const handleCreate = useCallback(() => {
    setEditChat(null);
    setFormVisible(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormVisible(false);
    setEditChat(null);
  }, []);

  return (
    <Screen>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: text + '20' }]}>
        <Text variant="body" style={{ fontWeight: '600', color: text }}>
          {t.chats}
        </Text>
        <IconButton
          icon={Search}
          size={22}
          onPress={() => setSearchVisible(true)}
        />
      </View>

      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="body" style={{ color: text + '80' }}>
            {t.createFirstChat}
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              onPress={() => navigation.navigate('ChatRoom', { chatId: item.id })}
              onLongPress={() => setMenuChat(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      <AnimatedPressable
        style={[styles.fab, { backgroundColor: text }]}
        onPress={handleCreate}
        scaleTo={0.9}>
        <Plus size={24} color={background} />
      </AnimatedPressable>

      <ChatContextMenu
        visible={menuChat !== null}
        canDelete={menuChat ? !menuChat.isSystem : false}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={() => setMenuChat(null)}
      />

      <ChatForm
        visible={formVisible}
        onClose={handleFormClose}
        onSaved={refresh}
        editChat={editChat}
      />

      <GlobalSearch
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
