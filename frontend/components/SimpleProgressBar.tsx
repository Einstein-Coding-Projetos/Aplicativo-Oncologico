import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SimpleProgressBarProps {
  currentValue: number;
  maxValue: number;
  height?: number;
}

export default function SimpleProgressBar({ currentValue, maxValue, height = 12 }: SimpleProgressBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const safeMax = Math.max(1, maxValue);
  const percent = Math.min(100, Math.round((currentValue / safeMax) * 100));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, { backgroundColor: colorScheme === 'dark' ? '#2a2a72' : '#e9d5ff', height, borderRadius: height / 2 }]}> 
        <View style={[styles.fill, { backgroundColor: colors.tint, width: `${percent}%`, height, borderRadius: height / 2 }]} />
      </View>
      <View style={styles.infoRow}>
        <Text style={[styles.infoText, { color: colors.text }]}>{currentValue} / {maxValue}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  bar: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
