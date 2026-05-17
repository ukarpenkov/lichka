import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';

function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lichka+</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;
