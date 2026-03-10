import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TreatmentProgressProps {
  currentDay: number;
  totalDays: number;
  treatmentStartDate?: string;
  progressPercent: number;
}

const CHARACTER = '🧘'; // Personagem placeholder

export default function TreatmentProgress({
  currentDay,
  totalDays,
  treatmentStartDate,
  progressPercent,
}: TreatmentProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

  // Se não há dados de tratamento, retornar null
  if (!totalDays || totalDays === 0) {
    return null;
  }

  // Calcular a posição do personagem (centralizar sobre a bolinha)
  const stageWidth = 32;
  const gapBetweenStages = 12;
  const characterPosition = (currentDay - 1) * (stageWidth + gapBetweenStages);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1e1b4b' : '#f3f0ff' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sua Jornada</Text>
        <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
          Dia {currentDay} de {totalDays}
        </Text>
      </View>

      {/* Personagem acima da linha */}
      <View style={styles.characterContainer}>
        <View style={[styles.characterTrack, { width: Dimensions.get('window').width - 40 }]}>
          <View
            style={[
              styles.character,
              {
                transform: [{ translateX: characterPosition }],
              },
            ]}
          >
            <Text style={styles.characterEmoji}>{CHARACTER}</Text>
          </View>
        </View>
      </View>

      {/* Linha de bolinhas (estágios) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stagesContainer}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {Array.from({ length: totalDays }).map((_, index) => {
          const dayNumber = index + 1;
          const isCompleted = dayNumber < currentDay;
          const isCurrent = dayNumber === currentDay;

          return (
            <View
              key={dayNumber}
              style={[
                styles.stage,
                {
                  backgroundColor: isCurrent
                    ? colors.tint
                    : isCompleted
                    ? colors.tint
                    : isDark
                    ? '#4c1d95'
                    : '#e9d5ff',
                  borderColor: isCurrent ? colors.tint : 'transparent',
                  borderWidth: isCurrent ? 3 : 0,
                },
              ]}
            >
              {isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </View>
          );
        })}
      </ScrollView>

      {/* Barra de progresso */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: isDark ? '#3730a3' : '#e9d5ff',
              overflow: 'hidden',
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.tint,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {Math.round(progressPercent)}%
        </Text>
      </View>

      {/* Data de início */}
      {treatmentStartDate && (
        <Text style={[styles.dateText, { color: colors.text, opacity: 0.6 }]}>
          Iniciado em {new Date(treatmentStartDate).toLocaleDateString('pt-BR')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  characterContainer: {
    height: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  characterTrack: {
    height: 40,
    justifyContent: 'center',
  },
  character: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterEmoji: {
    fontSize: 28,
  },
  stagesContainer: {
    marginVertical: 15,
    maxHeight: 60,
  },
  stage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 15,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
  },
  dateText: {
    fontSize: 12,
    marginTop: 12,
  },
});
