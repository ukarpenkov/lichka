jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { FlatList, View, Pressable, TextInput } = require('react-native');

  const chainable = () => {
    const self = {};
    const methods = [
      'enabled',
      'activeOffsetX',
      'activeOffsetY',
      'failOffsetX',
      'failOffsetY',
      'simultaneousWithExternalGesture',
      'blocksExternalGesture',
      'onBegin',
      'onStart',
      'onUpdate',
      'onEnd',
      'onFinalize',
      'onTouchesDown',
      'onTouchesUp',
      'onTouchesMove',
    ];
    for (const method of methods) {
      self[method] = () => self;
    }
    return self;
  };

  return {
    GestureHandlerRootView: ({ children }) => React.createElement(View, null, children),
    Gesture: {
      Pan: () => chainable(),
      Native: () => chainable(),
      LongPress: () => ({}),
      Manual: () => chainable(),
    },
    GestureDetector: ({ children }) => children,
    FlatList,
    Pressable,
    TextInput,
    State: {},
  };
});

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModalProvider: ({ children }) => children,
}));

jest.mock('react-native-screens', () => ({
  ScreenContainer: ({ children }) => children,
  Screen: ({ children }) => children,
  NativeScreen: ({ children }) => children,
  enableFreeze: () => {},
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }) => React.createElement('View', { style }, children),
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  };
});

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: (cb) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return React.useEffect(() => cb(), []);
    },
  };
});

jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => children,
    }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => children,
    }),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: {
      View: ({ children, style, ...rest }) =>
        React.createElement(require('react-native').View, { style, ...rest }, children),
      createAnimatedComponent: (C) => C,
      useSharedValue: (v) => ({ value: v }),
      useAnimatedStyle: (fn) => ({}),
      useAnimatedScrollHandler: () => ({}),
      useAnimatedKeyboard: () => ({ height: { value: 0 }, state: { value: 4 } }),
      useDerivedValue: (fn) => ({ value: 0 }),
      useReducedMotion: () => false,
      KeyboardState: { UNKNOWN: 0, OPENING: 1, OPEN: 2, CLOSING: 3, CLOSED: 4 },
      withSpring: (v) => v,
      withTiming: (v) => v,
      withRepeat: (v) => v,
      withSequence: (...args) => args[0],
      interpolate: (v) => v,
      Extrapolation: { CLAMP: 'clamp' },
      runOnJS: (fn) => fn,
      FadeIn: { duration: () => ({}) },
      FadeOut: { duration: () => ({}) },
      FadeInUp: { springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) },
      FadeOutDown: { duration: () => ({}) },
      Layout: { springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) },
      ZoomIn: { duration: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) },
      ZoomOut: { duration: () => ({}) },
    },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (fn) => ({}),
    useAnimatedScrollHandler: () => ({}),
    useAnimatedKeyboard: () => ({ height: { value: 0 }, state: { value: 4 } }),
    useDerivedValue: (fn) => ({ value: 0 }),
    useReducedMotion: () => false,
    KeyboardState: { UNKNOWN: 0, OPENING: 1, OPEN: 2, CLOSING: 3, CLOSED: 4 },
    withSpring: (v) => v,
    withTiming: (v) => v,
    withRepeat: (v) => v,
    withSequence: (...args) => args[0],
    interpolate: (v) => v,
    Extrapolation: { CLAMP: 'clamp' },
    runOnJS: (fn) => fn,
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
    FadeInUp: { springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) },
    FadeOutDown: { duration: () => ({}) },
    Layout: { springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) },
    ZoomIn: { duration: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) },
    ZoomOut: { duration: () => ({}) },
  };
});

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  CachesDirectoryPath: '/mock/caches',
  mkdir: jest.fn(),
  exists: jest.fn().mockResolvedValue(false),
  readDir: jest.fn().mockResolvedValue([]),
  unlink: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

jest.mock('react-native-zip-archive', () => ({
  zip: jest.fn().mockResolvedValue(''),
  unzip: jest.fn().mockResolvedValue(''),
}));

jest.mock('@op-engineering/op-sqlite', () => ({
  open: () => ({
    executeSync: jest.fn().mockReturnValue({ rows: [] }),
  }),
}));

jest.mock('react-native-audio-recorder-player', () => {
  return function MockRecorder() {
    return {
      startRecorder: jest.fn().mockResolvedValue('mock-uri'),
      stopRecorder: jest.fn().mockResolvedValue(''),
      addRecordBackListener: jest.fn(),
      removeRecordBackListener: jest.fn(),
    };
  };
});

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native-sound', () => {
  function MockSound() {
    return {
      play: jest.fn(),
      stop: jest.fn(),
      setVolume: jest.fn(),
    };
  }
  MockSound.setCategory = jest.fn();
  return MockSound;
});

jest.mock('react-native-document-picker', () => ({
  pickSingle: jest.fn(),
  types: { allFiles: 'all' },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ user: { id: 'mock' } }),
    getTokens: jest.fn().mockResolvedValue({ accessToken: 'mock-token' }),
    signOut: jest.fn(),
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));
