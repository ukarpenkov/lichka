import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from 'react';

type MainTabsContextValue = {
  activeIndex: number;
  /** Можно ли листать корневые табы горизонтальным свайпом. */
  tabSwipeEnabled: boolean;
  /**
   * Заблокировать/разблокировать свайп табов для конкретного вложенного стека.
   * Ключ — индекс таба (0 = чаты, 2 = настройки).
   */
  setNestedStackOpen: (tabIndex: number, open: boolean) => void;
};

const MainTabsContext = createContext<MainTabsContextValue>({
  activeIndex: 0,
  tabSwipeEnabled: true,
  setNestedStackOpen: () => {},
});

export function MainTabsProvider({
  activeIndex,
  children,
}: {
  activeIndex: number;
  children: React.ReactNode;
}) {
  const [nestedOpen, setNestedOpen] = useState<Record<number, boolean>>({});

  const setNestedStackOpen = useCallback((tabIndex: number, open: boolean) => {
    setNestedOpen((prev) => {
      if (Boolean(prev[tabIndex]) === open) return prev;
      return { ...prev, [tabIndex]: open };
    });
  }, []);

  const tabSwipeEnabled = !nestedOpen[activeIndex];

  const value = useMemo(
    () => ({ activeIndex, tabSwipeEnabled, setNestedStackOpen }),
    [activeIndex, tabSwipeEnabled, setNestedStackOpen],
  );

  return (
    <MainTabsContext.Provider value={value}>
      {children}
    </MainTabsContext.Provider>
  );
}

export function useMainTabs() {
  return useContext(MainTabsContext);
}

/** Подписка на то, что конкретный корневой таб стал видимым.
 *
 * Заменяет useFocusEffect для табов, потому что свайп-переключение
 * не меняет фокус react-navigation.
 */
export function useTabVisible(
  tabIndex: number,
  effect: () => void | (() => void),
  deps: React.DependencyList = [],
) {
  const { activeIndex } = useContext(MainTabsContext);

  useEffect(() => {
    if (activeIndex !== tabIndex) return;
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, tabIndex, effect, ...deps]);
}

/** Хук-обёртка: выполнить callback, когда таб становится видимым. */
export function useOnTabVisible(
  tabIndex: number,
  callback: () => void,
  deps: React.DependencyList = [],
) {
  const cb = useCallback(callback, deps);
  useTabVisible(tabIndex, cb, [cb]);
}
