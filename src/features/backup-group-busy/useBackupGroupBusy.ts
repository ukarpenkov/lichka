import { useCallback, useEffect, useRef, useState } from 'react';

export type BackupGroupAction =
  | 'driveBackup'
  | 'driveRestore'
  | 'exportFile'
  | 'importFile';

export type BackupGroupBusyApi = {
  activeAction: BackupGroupAction | null;
  isGroupDisabled: boolean;
  isActionLoading: (action: BackupGroupAction) => boolean;
  run: <T>(action: BackupGroupAction, task: () => Promise<T>) => Promise<T | undefined>;
};

export function useBackupGroupBusy(): BackupGroupBusyApi {
  const [activeAction, setActiveAction] = useState<BackupGroupAction | null>(null);
  const activeRef = useRef<BackupGroupAction | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async <T,>(action: BackupGroupAction, task: () => Promise<T>): Promise<T | undefined> => {
      if (activeRef.current) {
        return undefined;
      }
      activeRef.current = action;
      setActiveAction(action);
      try {
        return await task();
      } finally {
        activeRef.current = null;
        if (mountedRef.current) {
          setActiveAction(null);
        }
      }
    },
    [],
  );

  const isActionLoading = useCallback(
    (action: BackupGroupAction) => activeAction === action,
    [activeAction],
  );

  return {
    activeAction,
    isGroupDisabled: activeAction !== null,
    isActionLoading,
    run,
  };
}
