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
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import api from '../../lib/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe seu email para recuperar a senha.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.forgotPassword(email.trim());
      Alert.alert('Recuperacao iniciada', response.mensagem);

      // Dev/testing helper when backend exposes token in DEBUG.
      if (response.uid && response.token) {
        setUid(response.uid);
        setToken(response.token);
      }
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Nao foi possivel iniciar a recuperacao de senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Recuperar senha</Text>
      <Text style={styles.subtitle}>Informe seu email para gerar o token de redefinicao.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleRequestReset} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Enviar instrucoes</Text>}
      </TouchableOpacity>

      {uid && token ? (
        <View style={styles.devBox}>
          <Text style={styles.devTitle}>Token de teste (DEBUG)</Text>
          <Text style={styles.devText}>uid: {uid}</Text>
          <Text style={styles.devText}>token: {token}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push({ pathname: '/(auth)/resetpassword' as any, params: { uid, token } } as any)}
          >
            <Text style={styles.secondaryButtonText}>Continuar redefinicao</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Voltar ao login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 26,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#4F46E5',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  devBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 14,
  },
  devTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  devText: {
    color: '#374151',
    fontSize: 12,
    marginBottom: 4,
  },
  secondaryButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#111827',
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
