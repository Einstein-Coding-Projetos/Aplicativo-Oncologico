import { Image, StyleSheet, Platform, TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bem-vindo ao Gradatim!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Seu companheiro diário</ThemedText>
        <ThemedText>
          O Gradatim está aqui para apoiar sua jornada oncológica com ferramentas para seu bem-estar.
        </ThemedText>
      </ThemedView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/diario')}>
          <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
            <Ionicons name="book" size={32} color="#0284c7" />
          </View>
          <ThemedText type="subtitle" style={styles.cardTitle}>Diário</ThemedText>
          <ThemedText style={styles.cardText}>Registre como você se sente hoje.</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/agendamento')}>
           <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="calendar" size={32} color="#16a34a" />
          </View>
          <ThemedText type="subtitle" style={styles.cardTitle}>Agendar</ThemedText>
          <ThemedText style={styles.cardText}>Marque consultas com psicólogos.</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/relatos')}>
           <View style={[styles.iconBox, { backgroundColor: '#faf5ff' }]}>
            <Ionicons name="chatbubbles" size={32} color="#9333ea" />
          </View>
          <ThemedText type="subtitle" style={styles.cardTitle}>Relatos</ThemedText>
          <ThemedText style={styles.cardText}>Leia histórias inspiradoras.</ThemedText>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 24,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  actionsContainer: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
