import React, { Component, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { DEFAULT_LIGHT } from '../shared/config/theme';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={[styles.container, { backgroundColor: DEFAULT_LIGHT.background }]}>
          <View style={styles.content}>
            <View style={[styles.icon, { borderColor: DEFAULT_LIGHT.text }]}>
              <View style={[styles.exclamation, { backgroundColor: DEFAULT_LIGHT.text }]} />
              <View style={[styles.dot, { backgroundColor: DEFAULT_LIGHT.text }]} />
            </View>
            <View style={[styles.title, { backgroundColor: DEFAULT_LIGHT.text }]} />
            <View style={[styles.message1, { backgroundColor: DEFAULT_LIGHT.text + '40' }]} />
            <View style={[styles.message2, { backgroundColor: DEFAULT_LIGHT.text + '40' }]} />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exclamation: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  title: {
    width: 160,
    height: 16,
    borderRadius: 4,
  },
  message1: {
    width: 220,
    height: 12,
    borderRadius: 4,
  },
  message2: {
    width: 180,
    height: 12,
    borderRadius: 4,
  },
});
