import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface StreakCounterProps {
  streakDays: number;
  onPress?: () => void;
}

export default function StreakCounter({ streakDays, onPress }: StreakCounterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // pequeno destaque quando o valor muda
    scale.setValue(0.9);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  }, [streakDays]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Animated.View style={[styles.container, { backgroundColor: colors.background, transform: [{ scale }] }]}> 
        <View style={[styles.circle, { backgroundColor: colors.tint }]}> 
          <Text style={styles.number}>{streakDays}</Text>
        </View>
        <Text style={[styles.label, { color: colors.text }]}>Dias seguidos</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 120,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  number: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
