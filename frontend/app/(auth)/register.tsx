import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import api from '../../lib/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPsicologo, setIsPsicologo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Campos obrigatórios', 'Preencha usuário e senha.');
      return;
    }

    setLoading(true);
    try {
      // Enviando os 4 parâmetros para a API
      await api.register(
        username.trim(), 
        password, 
        email.trim() || undefined, 
        isPsicologo 
      );
      
      await api.login(username.trim(), password);
      
      if (isPsicologo) {
        router.replace('/(psicologo)');
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Gradatim</Text>
      <Text style={styles.subtitle}>Crie sua conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        placeholderTextColor="#9FB2D8"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail (opcional)"
        placeholderTextColor="#9FB2D8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9FB2D8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* APENAS UM CONTAINER DE SWITCH AQUI */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Sou Psicólogo(a)</Text>
        <Switch
          value={isPsicologo}
          onValueChange={(value) => setIsPsicologo(value)}
          trackColor={{ false: '#2E4D79', true: '#0B63F6' }}
          thumbColor={isPsicologo ? '#fff' : '#A9C4E8'}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EAF4FF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A9C4E8',
    textAlign: 'center',
    marginBottom: 36,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2E4D79',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#F0F7FF',
    backgroundColor: '#10213F',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#10213F',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E4D79',
    marginBottom: 16,
  },
  switchLabel: {
    color: '#F0F7FF',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0B63F6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#7DD3FC',
    textAlign: 'center',
    fontSize: 14,
  },
});