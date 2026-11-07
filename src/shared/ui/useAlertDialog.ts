import { useCallback, useState } from 'react';
import type { AlertButton } from './AlertDialog';

export type AlertDialogState = {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
} | null;

export function useAlertDialog(onDismiss?: () => void) {
  const [dialog, setDialog] = useState<AlertDialogState>(null);

  const close = useCallback(() => {
    setDialog(null);
    onDismiss?.();
  }, [onDismiss]);

  return {
    show: setDialog,
    dialogProps: {
      visible: dialog !== null,
      title: dialog?.title,
      message: dialog?.message,
      buttons: dialog?.buttons,
      onClose: close,
    },
  };
}
