import { act, renderHook } from '@testing-library/react-native';

import { useBackupGroupBusy } from '..';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useBackupGroupBusy', () => {
  it('should mark the started action as loading and disable the group', async () => {
    const pending = deferred<void>();
    const { result } = renderHook(() => useBackupGroupBusy());

    let runPromise: Promise<unknown> = Promise.resolve();
    act(() => {
      runPromise = result.current.run('exportFile', () => pending.promise);
    });

    expect(result.current.activeAction).toBe('exportFile');
    expect(result.current.isGroupDisabled).toBe(true);
    expect(result.current.isActionLoading('exportFile')).toBe(true);
    expect(result.current.isActionLoading('driveBackup')).toBe(false);

    await act(async () => {
      pending.resolve();
      await runPromise;
    });
  });

  it('should clear loading after the task resolves', async () => {
    const { result } = renderHook(() => useBackupGroupBusy());

    await act(async () => {
      await result.current.run('driveBackup', async () => 'ok');
    });

    expect(result.current.activeAction).toBeNull();
    expect(result.current.isGroupDisabled).toBe(false);
    expect(result.current.isActionLoading('driveBackup')).toBe(false);
  });

  it('should clear loading after the task rejects', async () => {
    const { result } = renderHook(() => useBackupGroupBusy());

    await act(async () => {
      await expect(
        result.current.run('importFile', async () => {
          throw new Error('boom');
        }),
      ).rejects.toThrow('boom');
    });

    expect(result.current.activeAction).toBeNull();
    expect(result.current.isGroupDisabled).toBe(false);
  });

  it('should not start a second action while the first is in flight', async () => {
    const first = deferred<string>();
    const secondTask = jest.fn(async () => 'second');
    const { result } = renderHook(() => useBackupGroupBusy());

    let firstRun: Promise<unknown> = Promise.resolve();
    act(() => {
      firstRun = result.current.run('driveRestore', () => first.promise);
    });

    let secondResult: string | undefined = 'sentinel';
    await act(async () => {
      secondResult = await result.current.run('exportFile', secondTask);
    });

    expect(secondTask).not.toHaveBeenCalled();
    expect(secondResult).toBeUndefined();
    expect(result.current.activeAction).toBe('driveRestore');

    await act(async () => {
      first.resolve('first');
      await firstRun;
    });

    expect(result.current.activeAction).toBeNull();
  });

  it('should allow a new action after the previous finished', async () => {
    const { result } = renderHook(() => useBackupGroupBusy());

    await act(async () => {
      await result.current.run('exportFile', async () => undefined);
    });

    await act(async () => {
      await result.current.run('importFile', async () => undefined);
    });

    expect(result.current.activeAction).toBeNull();
    expect(result.current.isGroupDisabled).toBe(false);
  });

  it('should not update state after unmount when the task finishes', async () => {
    const pending = deferred<void>();
    const { result, unmount } = renderHook(() => useBackupGroupBusy());

    let runPromise: Promise<unknown> = Promise.resolve();
    act(() => {
      runPromise = result.current.run('driveBackup', () => pending.promise);
    });

    unmount();

    await act(async () => {
      pending.resolve();
      await runPromise;
    });
  });
});
