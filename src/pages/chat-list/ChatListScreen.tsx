import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, View, StyleSheet, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Search } from '../../shared/ui/pixel';

import {
  Screen,
  Text,
  IconButton,
  AnimatedPressable,
  AlertDialog,
  PageHeader,
  type AlertButton,
} from '../../shared/ui';
import { useTheme, useLocale, fabShadow } from '../../shared/config';
import { getChats, deleteChat, type Chat } from '../../entities/chat';
import { getUnreadCounts } from '../../entities/message';
import type { ChatStackParamList } from '../../app/types';
import { useOnTabVisible } from '../../app/MainTabsContext';
import { ChatForm } from '../../widgets/chat-form';
import { setChatStackNavigation } from '../../app/mainTabsApi';

import { ChatListItem } from './ChatListItem';
import { ChatContextMenu } from './ChatContextMenu';
import { GlobalSearch } from './GlobalSearch';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

export function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const [chats, setChats] = useState<Chat[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [menuChat, setMenuChat] = useState<Chat | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editChat, setEditChat] = useState<Chat | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [dialog, setDialog] = useState<{
    title?: string;
    message?: string;
    buttons?: AlertButton[];
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      setChats(getChats());
      setUnreadCounts(getUnreadCounts());
    }, []),
  );

  const refresh = useCallback(() => {
    setChats(getChats());
    setUnreadCounts(getUnreadCounts());
  }, []);

  useOnTabVisible(0, refresh, [refresh]);

  useEffect(() => {
    setChatStackNavigation({
      navigate: (name, params) => navigation.navigate(name, params),
      getCurrentRoute: () => {
        const state = navigation.getState();
        const route = state.routes[state.index];
        if (!route) return undefined;
        return {
          name: route.name,
          params: route.params as { chatId?: string; messageId?: string } | undefined,
        };
      },
      // setParams работает только когда ChatList в фокусе; для ChatRoom
      // диспатчим через navigate с merge — см. openChatRoom в mainTabsApi.
      setParams: (params) => {
        navigation.navigate({
          name: 'ChatRoom',
          params,
          merge: true,
        });
      },
    });
    return () => setChatStackNavigation(null);
  }, [navigation]);

  const handleDelete = useCallback(() => {
    if (!menuChat) return;
    setDialog({
      title: t.deleteChat,
      message: t.deleteChatConfirm(menuChat.title),
      buttons: [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            deleteChat(menuChat.id);
            setChats(getChats());
          },
        },
      ],
    });
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
      <PageHeader
        title={t.chats}
        right={
          <IconButton
            icon={Search}
            size={24}
            onPress={() => setSearchVisible(true)}
          />
        }
      />

      {chats.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.canvas }]}>
          <Text variant="body-sm" tone="muted">
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
              unreadCount={unreadCounts[item.id] ?? 0}
              onPress={() => navigation.navigate('ChatRoom', { chatId: item.id })}
              onLongPress={() => setMenuChat(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.canvas }}
        />
      )}

      <View style={[styles.fabShadow, fabShadow]}>
        <AnimatedPressable
          style={[styles.fab, { backgroundColor: colors.ink }]}
          onPress={handleCreate}
          scaleTo={0.9}
          {...(Platform.OS === 'android'
            ? { android_ripple: { color: colors.surfaceStrong, borderless: true, radius: 28 } }
            : {})}>
          <Plus size={24} color={colors.onInk} />
        </AnimatedPressable>
      </View>

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

      <AlertDialog
        visible={dialog !== null}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons}
        onClose={() => setDialog(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabShadow: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
