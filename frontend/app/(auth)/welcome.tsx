import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../lib/api';
import DatePickerField from '../../components/DatePickerField';
import { todayIsoDate } from '../../lib/treatment';

export default function WelcomeScreen() {
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [treatmentEndDate, setTreatmentEndDate] = useState(todayIsoDate());
  const [bio, setBio] = useState('');

  useEffect(() => {
    (async () => {
      const authenticated = await api.isAuthenticated();
      if (!authenticated) {
        router.replace('/(auth)/login');
        return;
      }
      setCheckingAuth(false);
    })();
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await api.completeTreatmentOnboarding({
        treatmentEndDate,
        bio,
      });
      router.replace('/(tabs)/diario');
    } catch (error: any) {
      Alert.alert('Erro', error?.message ?? 'Nao foi possivel salvar suas informacoes.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7DD3FC" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Bem-vindo(a) ao Gradatim</Text>
      <Text style={styles.subtitle}>
        Para personalizar sua jornada, precisamos de algumas informacoes iniciais do tratamento.
      </Text>

      <DatePickerField
        label="Data final prevista do tratamento"
        value={treatmentEndDate}
        onChange={setTreatmentEndDate}
        minDate={todayIsoDate()}
        helperText="Apps modernos costumam usar calendario nativo ou seletor visual para evitar erro de digitacao."
      />

      <Text style={styles.label}>Observacoes iniciais (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Como voce esta se sentindo no inicio da jornada?"
        placeholderTextColor="#9FB2D8"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continuar</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#070F21',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070F21',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EAF4FF',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: '#A9C4E8',
    marginBottom: 26,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    color: '#B9D6FF',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2E4D79',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    color: '#F0F7FF',
    backgroundColor: '#10213F',
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0B63F6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
