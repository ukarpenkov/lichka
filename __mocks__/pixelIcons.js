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
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      return make(String(prop));
    },
  },
);
