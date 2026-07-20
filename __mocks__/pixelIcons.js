const React = require('react');

function make(name) {
  const Component = (props) =>
    React.createElement('View', { testID: `icon-${name}`, ...props });
  Component.displayName = name;
  return Component;
}

module.exports = new Proxy(
  {
    __esModule: true,
    PixelIcon: make('Pixel'),
    createPixelIcon: (name) => make(name),
    isChatIconAvatar: (path) =>
      typeof path === 'string' &&
      !path.includes('/') &&
      !path.includes('\\') &&
      !path.startsWith('file:') &&
      /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(path),
    CHAT_AVATAR_ICONS: ['transportation-plane', 'pet-animals-cat'],
    DEFAULT_CHAT_ICON: 'social-rewards-certified-ribbon',
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      return make(String(prop));
    },
  },
);
