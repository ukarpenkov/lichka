import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, Smile, X } from 'lucide-react-native';

import { Input, Button, Text } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';
import { createChat, updateChat, type Chat } from '../../entities/chat';
import { resolveMediaPath, saveAvatar, generateId } from '../../shared/lib';

import { EmojiGrid } from './EmojiGrid';

type ChatFormProps = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  editChat?: Chat | null;
};

export function ChatForm({ visible, onClose, onSaved, editChat }: ChatFormProps) {
  const { text, background } = useTheme();
  const { t } = useLocale();

  const isPickingImage = useRef(false);

  const [title, setTitle] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [emojiAvatar, setEmojiAvatar] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!editChat;
  const canSave = title.trim().length > 0;

  useEffect(() => {
    if (visible) {
      if (editChat) {
        setTitle(editChat.title);
        if (editChat.avatarPath && !editChat.avatarPath.includes('/') && !editChat.avatarPath.includes('\\')) {
          setAvatarUri(null);
          setEmojiAvatar(editChat.avatarPath);
        } else {
          setAvatarUri(editChat.avatarPath ? `file://${resolveMediaPath(editChat.avatarPath)}` : null);
          setEmojiAvatar(null);
        }
      } else {
        setTitle('');
        setAvatarUri(null);
        setEmojiAvatar(null);
      }
      setShowEmojiPicker(false);
    }
  }, [visible, editChat]);

  const handlePickImage = useCallback(() => {
    isPickingImage.current = true;
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.85 as import('react-native-image-picker').PhotoQuality,
      },
      (response) => {
        isPickingImage.current = false;
        if (response.didCancel || response.errorCode) {
          if (response.errorCode) {
            Alert.alert(t.error, response.errorMessage || t.photoPickError);
          }
          return;
        }
        const asset = response.assets?.[0];
        if (asset?.uri) {
          setAvatarUri(asset.uri);
          setEmojiAvatar(null);
        }
      },
    );
  }, [t]);

  const handleAvatarTap = useCallback(() => {
    if (emojiAvatar) {
      setShowEmojiPicker(true);
    } else {
      handlePickImage();
    }
  }, [emojiAvatar, handlePickImage]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setEmojiAvatar(emoji);
    setAvatarUri(null);
    setShowEmojiPicker(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return;
    setSaving(true);

    try {
      let avatarPath: string | null = editChat?.avatarPath ?? null;

      if (avatarUri) {
        const chatId = editChat?.id || generateId();
        avatarPath = await saveAvatar(avatarUri, chatId);
      } else if (emojiAvatar) {
        avatarPath = emojiAvatar;
      } else if (!avatarUri && !emojiAvatar && editChat) {
        avatarPath = editChat.avatarPath;
      }

      if (isEdit && editChat) {
        updateChat(editChat.id, { title: title.trim(), avatarPath });
      } else {
        createChat(title.trim(), avatarPath);
      }

      onSaved();
      onClose();
    } catch (e: any) {
      console.error('ChatForm handleSave error:', e);
      Alert.alert(t.error, e?.message ?? t.chatSaveError);
    } finally {
      setSaving(false);
    }
  }, [canSave, saving, title, avatarUri, emojiAvatar, editChat, isEdit, onSaved, onClose, t]);

  const avatarContent = () => {
    if (avatarUri) {
      return (
        <Image
          source={{ uri: avatarUri }}
          style={[styles.avatarImage, { borderColor: text + '33' }]}
        />
      );
    }
    if (emojiAvatar) {
      return (
        <View style={[styles.avatarEmoji, { backgroundColor: text + '15' }]}>
          <Text style={styles.avatarEmojiText}>{emojiAvatar}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.avatarPlaceholder, { backgroundColor: text + '15', borderColor: text + '33' }]}>
        <Camera size={28} color={text + '66'} />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.sheetContent, { backgroundColor: background }]}>
          {showEmojiPicker ? (
            <>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setShowEmojiPicker(false)} style={styles.closeBtn}>
                  <X size={20} color={text + '99'} />
                </Pressable>
              </View>
              <EmojiGrid onSelect={handleEmojiSelect} />
            </>
          ) : (
            <>
              <View style={styles.sheetHeader}>
                <Text variant="body" style={[styles.headerTitle, { color: text }]}>
                  {isEdit ? t.editChat : t.newChat}
                </Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={text + '99'} />
                </Pressable>
              </View>

              <View style={styles.avatarButton}>
                <Pressable onPress={handleAvatarTap}>
                  {avatarContent()}
                </Pressable>
                <View style={styles.avatarActions}>
                  <Pressable style={styles.avatarActionBtn} onPress={handlePickImage}>
                    <Camera size={18} color={text + '99'} />
                    <Text variant="caption" style={{ color: text + '99' }}>{t.photo}</Text>
                  </Pressable>
                  <Pressable style={styles.avatarActionBtn} onPress={() => setShowEmojiPicker(true)}>
                    <Smile size={18} color={text + '99'} />
                    <Text variant="caption" style={{ color: text + '99' }}>{t.emoji}</Text>
                  </Pressable>
                </View>
              </View>

              <Input
                placeholder={t.chatNamePlaceholder}
                value={title}
                onChangeText={setTitle}
                autoFocus={!isEdit}
              />

              <View style={styles.actions}>
                <Button
                  title={isEdit ? t.save : t.create}
                  onPress={handleSave}
                  disabled={!canSave || saving}
                  style={[
                    styles.saveButton,
                    {
                      backgroundColor: text,
                      opacity: !canSave || saving ? 0.4 : 1,
                    },
                  ]}
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  avatarButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
  },
  avatarEmoji: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmojiText: {
    fontSize: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  avatarActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 24,
  },
  avatarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actions: {
    marginTop: 24,
    alignItems: 'center',
  },
  saveButton: {
    minWidth: 200,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});
