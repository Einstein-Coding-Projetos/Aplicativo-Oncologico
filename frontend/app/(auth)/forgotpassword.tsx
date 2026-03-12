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
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Campo obrigatorio', 'Informe seu email para recuperar a senha.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.forgotPassword(email.trim());
      setFeedback(response.mensagem);

      if (response.uid && response.token) {
        router.push({
          pathname: '/(auth)/resetpassword',
          params: { uid: response.uid, token: response.token, email: email.trim() },
        } as any);
        return;
      }

      Alert.alert('Recuperacao iniciada', response.mensagem);
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
      <Text style={styles.subtitle}>
        Informe seu email para iniciar a redefinicao. Em ambiente local, o app continua direto para a tela de nova senha.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9FB2D8"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleRequestReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continuar</Text>}
      </TouchableOpacity>

      {feedback ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Pedido enviado</Text>
          <Text style={styles.infoText}>{feedback}</Text>
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
    backgroundColor: '#070F21',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EAF4FF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#A9C4E8',
    textAlign: 'center',
    marginBottom: 26,
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
  button: {
    backgroundColor: '#0B63F6',
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
    color: '#7DD3FC',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#2E4D79',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#10213F',
    marginBottom: 14,
  },
  infoTitle: {
    fontWeight: '700',
    color: '#EAF4FF',
    marginBottom: 6,
  },
  infoText: {
    color: '#B9D6FF',
    fontSize: 13,
  },
});
