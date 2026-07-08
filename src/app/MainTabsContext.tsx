import React, { createContext, useContext, useEffect, useCallback } from 'react';

type MainTabsContextValue = {
  activeIndex: number;
};

const MainTabsContext = createContext<MainTabsContextValue>({ activeIndex: 0 });

export function MainTabsProvider({
  activeIndex,
  children,
}: {
  activeIndex: number;
  children: React.ReactNode;
}) {
  return (
    <MainTabsContext.Provider value={{ activeIndex }}>
      {children}
    </MainTabsContext.Provider>
  );
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
