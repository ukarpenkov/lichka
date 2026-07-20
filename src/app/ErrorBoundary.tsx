import React, { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DEFAULT_LIGHT } from '../shared/config/theme';
import { fonts, monoWeight } from '../shared/config/tokens';

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

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error.message || String(this.state.error);
      const stack = this.state.error.stack;

      return (
        <View style={[styles.container, { backgroundColor: DEFAULT_LIGHT.background }]}>
          <View style={styles.content}>
            <View style={[styles.icon, { borderColor: DEFAULT_LIGHT.text }]}>
              <View style={[styles.exclamation, { backgroundColor: DEFAULT_LIGHT.text }]} />
              <View style={[styles.dot, { backgroundColor: DEFAULT_LIGHT.text }]} />
            </View>
            <Text style={[styles.title, { color: DEFAULT_LIGHT.text }]}>
              Something went wrong
            </Text>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
            >
              <Text style={[styles.message, { color: DEFAULT_LIGHT.text }]} selectable>
                {message}
              </Text>
              {__DEV__ && stack ? (
                <Text style={[styles.stack, { color: DEFAULT_LIGHT.text + '99' }]} selectable>
                  {stack}
                </Text>
              ) : null}
            </ScrollView>
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
    maxWidth: 360,
    width: '100%',
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
    fontSize: 18,
    ...monoWeight('semiBold'),
    textAlign: 'center',
  },
  scroll: {
    maxHeight: 280,
    width: '100%',
  },
  scrollContent: {
    gap: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  stack: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.regular,
  },
});
