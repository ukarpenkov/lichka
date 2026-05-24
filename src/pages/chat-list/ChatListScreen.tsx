import React, { useState, useCallback } from 'react';
import { FlatList, Pressable, Alert, View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import { Screen, Text } from '../../shared/ui';
import { useTheme } from '../../shared/config';
import { getChats, deleteChat, type Chat } from '../../entities/chat';
import type { ChatStackParamList } from '../../app/types';

import { ChatListItem } from './ChatListItem';
import { ChatContextMenu } from './ChatContextMenu';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

export function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const { text, background } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [menuChat, setMenuChat] = useState<Chat | null>(null);

  useFocusEffect(
    useCallback(() => {
      setChats(getChats());
    }, []),
  );

  const handleDelete = useCallback(() => {
    if (!menuChat) return;
    Alert.alert('Удалить чат', `Удалить «${menuChat.title}»?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          deleteChat(menuChat.id);
          setChats(getChats());
        },
      },
    ]);
  }, [menuChat]);

  const handleEdit = useCallback(() => {
    // TODO: переход на экран редактирования чата
  }, []);

  return (
    <Screen>
      {chats.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="body" style={{ color: text + '80' }}>
            Создайте первый чат
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
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: text,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={() => {
          // TODO: создание нового чата
        }}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={background} />
        </Svg>
      </Pressable>

      <ChatContextMenu
        visible={menuChat !== null}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={() => setMenuChat(null)}
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
