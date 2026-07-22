import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '../Avatar';

jest.mock('../../config', () => ({
  useTheme: () => ({ text: '#39FF14', background: '#000000' }),
}));

jest.mock('../pixel', () => {
  const React = require('react');
  return {
    PixelIcon: ({ name, color, size }: { name: string; color: string; size: number }) =>
      React.createElement('View', { testID: `pixel-${name}`, accessibilityLabel: `${color}:${size}` }),
    isChatIconAvatar: (path: string) =>
      typeof path === 'string' &&
      !path.includes('/') &&
      /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(path),
  };
});

describe('Avatar', () => {
  it('should render themed pixel icon for chat icon avatar', () => {
    const { getByTestId } = render(
      <Avatar title="Work" avatarPath="transportation-plane" size={48} />,
    );

    const icon = getByTestId('pixel-transportation-plane');
    expect(icon.props.accessibilityLabel).toBe('#39FF14:24');
  });

  it('should render legacy emoji when avatar is not an icon id', () => {
    const { getByText } = render(
      <Avatar title="Old" avatarPath="🔖" size={48} />,
    );

    expect(getByText('🔖')).toBeTruthy();
  });

  it('should render title initial when avatar is missing', () => {
    const { getByText } = render(<Avatar title="Notes" />);

    expect(getByText('N')).toBeTruthy();
  });
});
