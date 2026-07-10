import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { useTheme } from '../../../shared/config';
import { SeamlessDateChip } from '../SeamlessDateChip';

jest.mock('../../../shared/config', () => ({
  useTheme: jest.fn(),
}));

const useThemeMock = useTheme as jest.Mock;

function flatStyle(node: any) {
  return StyleSheet.flatten(node.props.style) ?? {};
}

function findByTestId(root: any, id: string): any {
  if (!root) return null;
  if (root.props?.testID === id) return root;
  const children = Array.isArray(root.children) ? root.children : [];
  for (const c of children) {
    if (typeof c !== 'object') continue;
    const found = findByTestId(c, id);
    if (found) return found;
  }
  return null;
}

function collectViews(root: any): any[] {
  const acc: any[] = [];
  const visit = (n: any) => {
    if (!n || typeof n !== 'object') return;
    if (n.type === 'View' || n.props?.children !== undefined) acc.push(n);
    const children = Array.isArray(n.children) ? n.children : [];
    for (const c of children) visit(c);
  };
  visit(root);
  return acc;
}

describe('SeamlessDateChip', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });
  });

  it('should render the label', () => {
    const { getByText } = render(
      <SeamlessDateChip label="Today" testID="chip" />,
    );

    expect(getByText('Today')).toBeTruthy();
  });

  it('should not have borderWidth', () => {
    const result = render(
      <SeamlessDateChip label="Today" testID="chip" />,
    );
    const node = findByTestId(result.UNSAFE_root, 'chip');
    expect(node).toBeTruthy();
    const style = flatStyle(node);
    expect(style.borderWidth).toBeUndefined();
    expect(style.borderBottomWidth).toBeUndefined();
  });

  it('should apply pill background when pill=true (default)', () => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });

    const result = render(
      <SeamlessDateChip label="Today" testID="chip" />,
    );
    const views = collectViews(result.UNSAFE_root);
    const pillView = views.find((v) => flatStyle(v).backgroundColor === '#00000010');
    expect(pillView).toBeTruthy();
    expect(flatStyle(pillView).borderRadius).toBeGreaterThan(0);
  });

  it('should NOT apply pill background when pill=false', () => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });

    const result = render(
      <SeamlessDateChip label="Today" testID="chip" pill={false} />,
    );
    const views = collectViews(result.UNSAFE_root);
    const pillView = views.find((v: any) => {
      const s = flatStyle(v);
      return s?.backgroundColor?.endsWith?.('10');
    });
    expect(pillView).toBeUndefined();
  });

  it('should use text-based meta color from theme', () => {
    useThemeMock.mockReturnValue({ background: '#000000', text: '#FFFFFF' });

    const { getByText } = render(
      <SeamlessDateChip label="Today" testID="chip" />,
    );

    const style = flatStyle(getByText('Today'));
    expect(style.color).toBe('#FFFFFF60');
  });
});
