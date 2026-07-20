import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { Camera, Smile, X, PixelIcon, isChatIconAvatar } from '../../shared/ui/pixel';

import { Input, Button, Text, AlertDialog, type AlertButton } from '../../shared/ui';
import { useTheme, useLocale, monoWeight } from '../../shared/config';
import { createChat, updateChat, type Chat } from '../../entities/chat';
import { resolveMediaPath, saveAvatarPng, generateId } from '../../shared/lib';
import { createPixelContourAvatarFromBytes, base64ToBytes } from '../../features/pixel-avatar';

import { IconGrid } from './IconGrid';

type ChatFormProps = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  editChat?: Chat | null;
};

async function loadPickedImageBytes(uri: string, pickerBase64?: string): Promise<Uint8Array> {
  const errors: string[] = [];

  const tryReadPath = async (path: string): Promise<Uint8Array | null> => {
    try {
      const exists = await RNFS.exists(path);
      if (!exists) {
        errors.push(`missing:${path}`);
        return null;
      }
      const b64 = await RNFS.readFile(path, 'base64');
      if (!b64) {
        errors.push(`empty-file:${path}`);
        return null;
      }
      return base64ToBytes(b64);
    } catch (e: unknown) {
      errors.push(`read:${path}:${e instanceof Error ? e.message : String(e)}`);
      return null;
    }
  };

  // 1) Resized picker temp file (preferred — real bytes after maxWidth/quality)
  if (uri.startsWith('file://')) {
    const fromFile = await tryReadPath(uri.replace('file://', ''));
    if (fromFile) return fromFile;
  } else if (uri.startsWith('/')) {
    const fromFile = await tryReadPath(uri);
    if (fromFile) return fromFile;
  }

  // 2) content:// — copy into cache then read (common on Android gallery)
  if (uri.startsWith('content://')) {
    try {
      const dest = `${RNFS.CachesDirectoryPath}/lichka-pixel-avatar-in.bin`;
      if (await RNFS.exists(dest)) {
        await RNFS.unlink(dest);
      }
      await RNFS.copyFile(uri, dest);
      const copied = await tryReadPath(dest);
      if (copied) return copied;
    } catch (e: unknown) {
      errors.push(`content-copy:${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // 3) Picker base64 fallback
  if (pickerBase64) {
    try {
      return base64ToBytes(pickerBase64.replace(/\s/g, ''));
    } catch (e: unknown) {
      errors.push(`base64:${e instanceof Error ? e.message : String(e)}`);
    }
  }

  throw new Error(`Could not load picked image (${uri}). ${errors.join(' | ')}`);
}

export function ChatForm({ visible, onClose, onSaved, editChat }: ChatFormProps) {
  const { text, background } = useTheme();
  const { t } = useLocale();

  const isPickingImage = useRef(false);

  const [title, setTitle] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [pendingPngBase64, setPendingPngBase64] = useState<string | null>(null);
  const [iconAvatar, setIconAvatar] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const [dialog, setDialog] = useState<{
    title?: string;
    message?: string;
    buttons?: AlertButton[];
  } | null>(null);

  const isEdit = !!editChat;
  const canSave = title.trim().length > 0;

  useEffect(() => {
    if (visible) {
      if (editChat) {
        setTitle(editChat.title);
        const path = editChat.avatarPath;
        if (path && (isChatIconAvatar(path) || (!path.includes('/') && !path.includes('\\') && !path.startsWith('file:')))) {
          setAvatarUri(null);
          setPendingPngBase64(null);
          setIconAvatar(path);
        } else {
          setAvatarUri(path ? `file://${resolveMediaPath(path)}` : null);
          setPendingPngBase64(null);
          setIconAvatar(null);
        }
      } else {
        setTitle('');
        setAvatarUri(null);
        setPendingPngBase64(null);
        setIconAvatar(null);
      }
      setShowIconPicker(false);
      setProcessingAvatar(false);
    }
  }, [visible, editChat]);

  const applyPixelAvatar = useCallback(
    async (uri: string, pickerBase64?: string) => {
      setProcessingAvatar(true);
      try {
        // Prefer the picker temp file (resized) over asset.base64 — on Android
        // base64 is often the original PNG/WebP while uri points to a JPEG.
        const bytes = await loadPickedImageBytes(uri, pickerBase64);
        const result = createPixelContourAvatarFromBytes(bytes);
        setAvatarUri(result.dataUri);
        setPendingPngBase64(result.dataUri);
        setIconAvatar(null);
      } catch (e: any) {
        console.error('pixel avatar error:', e);
        setDialog({
          title: t.error,
          message: e?.message ?? t.photoPickError,
          buttons: [{ text: t.done }],
        });
      } finally {
        setProcessingAvatar(false);
      }
    },
    [t],
  );

  const handlePickImage = useCallback(() => {
    isPickingImage.current = true;
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.85 as import('react-native-image-picker').PhotoQuality,
        includeBase64: true,
        // Prefer JPEG-compatible representation when gallery has HEIC/HEIF
        assetRepresentationMode: 'compatible',
      },
      (response) => {
        isPickingImage.current = false;
        if (response.didCancel || response.errorCode) {
          if (response.errorCode) {
            setDialog({ title: t.error, message: response.errorMessage || t.photoPickError, buttons: [{ text: t.done }] });
          }
          return;
        }
        const asset = response.assets?.[0];
        if (asset?.uri) {
          void applyPixelAvatar(asset.uri, asset.base64);
        }
      },
    );
  }, [t, applyPixelAvatar]);

  const handleAvatarTap = useCallback(() => {
    if (iconAvatar) {
      setShowIconPicker(true);
    } else {
      handlePickImage();
    }
  }, [iconAvatar, handlePickImage]);

  const handleIconSelect = useCallback((iconId: string) => {
    setIconAvatar(iconId);
    setAvatarUri(null);
    setPendingPngBase64(null);
    setShowIconPicker(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave || saving || processingAvatar) return;
    setSaving(true);

    try {
      let avatarPath: string | null = editChat?.avatarPath ?? null;
      const chatId = editChat?.id || generateId();

      if (pendingPngBase64) {
        avatarPath = await saveAvatarPng(pendingPngBase64, chatId);
      } else if (iconAvatar) {
        avatarPath = iconAvatar;
      } else if (editChat) {
        avatarPath = editChat.avatarPath;
      }

      if (isEdit && editChat) {
        updateChat(editChat.id, { title: title.trim(), avatarPath });
      } else if (pendingPngBase64) {
        createChat(title.trim(), avatarPath, { id: chatId });
      } else {
        createChat(title.trim(), avatarPath);
      }

      onSaved();
      onClose();
    } catch (e: any) {
      console.error('ChatForm handleSave error:', e);
      setDialog({ title: t.error, message: e?.message ?? t.chatSaveError, buttons: [{ text: t.done }] });
    } finally {
      setSaving(false);
    }
  }, [canSave, saving, processingAvatar, title, pendingPngBase64, iconAvatar, editChat, isEdit, onSaved, onClose, t]);

  const avatarContent = () => {
    if (processingAvatar) {
      return (
        <View style={[styles.avatarPlaceholder, { backgroundColor: text + '15', borderColor: text + '33' }]}>
          <ActivityIndicator color={text} />
        </View>
      );
    }
    if (avatarUri) {
      return (
        <View style={[styles.avatarIcon, { backgroundColor: '#ffffff' }]}>
          <Image
            source={{ uri: avatarUri }}
            style={[styles.avatarImage, { borderColor: text + '33' }]}
            resizeMode="cover"
          />
        </View>
      );
    }
    if (iconAvatar) {
      if (isChatIconAvatar(iconAvatar)) {
        return (
          <View style={[styles.avatarIcon, { backgroundColor: text + '15' }]}>
            <PixelIcon name={iconAvatar} color={text} size={48} />
          </View>
        );
      }
      return (
        <View style={[styles.avatarIcon, { backgroundColor: text + '15' }]}>
          <Text style={styles.avatarEmojiText}>{iconAvatar}</Text>
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
        <View style={[styles.sheetContent, { backgroundColor: background }, showIconPicker && styles.sheetContentExpanded]}>
          {showIconPicker ? (
            <>
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setShowIconPicker(false)} style={styles.closeBtn}>
                  <X size={20} color={text + '99'} />
                </Pressable>
              </View>
              <IconGrid onSelect={handleIconSelect} />
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
                  <Pressable style={styles.avatarActionBtn} onPress={() => setShowIconPicker(true)}>
                    <Smile size={18} color={text + '99'} />
                    <Text variant="caption" style={{ color: text + '99' }}>{t.icon}</Text>
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
                  disabled={!canSave || saving || processingAvatar}
                  style={[
                    styles.saveButton,
                    {
                      backgroundColor: text,
                      opacity: !canSave || saving || processingAvatar ? 0.4 : 1,
                    },
                  ]}
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <AlertDialog
        visible={dialog !== null}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons}
        onClose={() => setDialog(null)}
      />
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
  sheetContentExpanded: {
    flex: 1,
    paddingHorizontal: 0,
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
    ...monoWeight('semiBold'),
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
  avatarIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmojiText: {
    fontSize: 48,
    lineHeight: 96,
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
