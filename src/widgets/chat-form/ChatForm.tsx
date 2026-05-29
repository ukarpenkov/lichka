import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, Smile } from 'lucide-react-native';

import { Input, Button, Text } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';
import { createChat, updateChat, type Chat } from '../../entities/chat';
import { saveAvatar, generateId } from '../../shared/lib';

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

  const modalRef = useRef<BottomSheetModal>(null);
  const wasVisible = useRef(false);

  const [title, setTitle] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [emojiAvatar, setEmojiAvatar] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!editChat;
  const canSave = title.trim().length > 0;

  const snapPoints = useMemo(() => [90], []);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      if (editChat) {
        setTitle(editChat.title);
        setAvatarUri(editChat.avatarPath ? `file://${editChat.avatarPath}` : null);
        setEmojiAvatar(null);
      } else {
        setTitle('');
        setAvatarUri(null);
        setEmojiAvatar(null);
      }
      setShowEmojiPicker(false);
      modalRef.current?.present();
    } else if (!visible && wasVisible.current) {
      modalRef.current?.dismiss();
    }
    wasVisible.current = visible;
  }, [visible, editChat]);

  const handlePickImage = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.85,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(t.error, response.errorMessage || t.photoPickError);
          return;
        }
        const asset = response.assets?.[0];
        if (asset?.uri) {
          setAvatarUri(asset.uri);
          setEmojiAvatar(null);
        }
      },
    );
  }, []);

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
        avatarPath = null;
      } else if (!avatarUri && !emojiAvatar && editChat) {
        avatarPath = editChat.avatarPath;
      }

      if (isEdit && editChat) {
        updateChat(editChat.id, { title: title.trim(), avatarPath });
      } else {
        createChat(title.trim(), avatarPath);
      }

      onSaved();
      modalRef.current?.dismiss();
    } catch (e: any) {
      console.error('ChatForm handleSave error:', e);
      Alert.alert(t.error, e?.message ?? t.chatSaveError);
    } finally {
      setSaving(false);
    }
  }, [canSave, saving, title, avatarUri, emojiAvatar, editChat, isEdit, onSaved]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

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
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      index={0}
      backgroundStyle={{ backgroundColor: background }}
      handleIndicatorStyle={{ backgroundColor: text + '40' }}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}>
      <BottomSheetView style={styles.sheetContent}>
        {showEmojiPicker ? (
          <EmojiGrid onSelect={handleEmojiSelect} />
        ) : (
          <>
            <Text variant="body" style={[styles.headerTitle, { color: text }]}>
              {isEdit ? t.editChat : t.newChat}
            </Text>

            <View style={styles.avatarButton}>
              {avatarContent()}
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
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
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
