import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const BoltWatermark = () => (
  <View style={styles.container} pointerEvents="none">
    <Image
      source={require('../assets/images/white_circle_360x360.png')}
      style={styles.image}
      resizeMode="contain"
      accessibilityLabel="Powered by Bolt.new"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 9999,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  image: {
    width: 64,
    height: 64,
  },
});

export default BoltWatermark; 