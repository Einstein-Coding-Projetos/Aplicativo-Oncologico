import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TreatmentProgressBarProps {
  currentValue: number;
  maxValue: number;
}

export default function TreatmentProgressBar({ currentValue, maxValue }: TreatmentProgressBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const safeMax = Math.max(1, maxValue);
  const percent = Math.min(100, Math.round((currentValue / safeMax) * 100));

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1e1b4b' : '#f3f0ff' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Progresso do Tratamento</Text>
        <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
          Dia {currentValue} de {maxValue}
        </Text>
      </View>

      <View
        style={[
          styles.bar,
          {
            backgroundColor: isDark ? '#3730a3' : '#e9d5ff',
            overflow: 'hidden',
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.tint,
              width: `${percent}%`,
            },
          ]}
        />
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          {currentValue} / {maxValue}
        </Text>
        <Text style={[styles.infoText, { color: colors.text }]}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  bar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
