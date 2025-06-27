import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';

export default function TypingIndicator() {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const duration = 600;
      const delay = 200;

      const createAnimation = (animatedValue: Animated.Value, delayTime: number) =>
        Animated.sequence([
          Animated.delay(delayTime),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.3,
            duration: duration,
            useNativeDriver: true,
          }),
        ]);

      const animation = Animated.loop(
        Animated.parallel([
          createAnimation(dot1Opacity, 0),
          createAnimation(dot2Opacity, delay),
          createAnimation(dot3Opacity, delay * 2),
        ])
      );

      animation.start();

      return () => animation.stop();
    };

    const cleanup = animateDots();
    return cleanup;
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
        </View>
        <Text style={styles.typingText}>LoopMind está escribiendo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  messageContainer: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B73FF',
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
}); 