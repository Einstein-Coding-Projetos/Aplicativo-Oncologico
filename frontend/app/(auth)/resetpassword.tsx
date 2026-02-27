import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import api from '../../lib/api';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ uid?: string; token?: string }>();
  const [uid, setUid] = useState(params.uid ?? '');
  const [token, setToken] = useState(params.token ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return uid.trim().length > 0 && token.trim().length > 0 && newPassword.length > 0 && confirmPassword.length > 0;
  }, [uid, token, newPassword, confirmPassword]);

  const handleReset = async () => {
    if (!canSubmit) {
      Alert.alert('Campos obrigatorios', 'Preencha uid, token e senha.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Senha invalida', 'As senhas nao conferem.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(uid.trim(), token.trim(), newPassword);
      Alert.alert('Sucesso', 'Senha redefinida com sucesso.');
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Nao foi possivel redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.title}>Redefinir senha</Text>
      <Text style={styles.subtitle}>Informe uid, token e sua nova senha.</Text>

      <TextInput
        style={styles.input}
        placeholder="uid"
        value={uid}
        onChangeText={setUid}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="token"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar nova senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleReset} disabled={loading || !canSubmit}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Redefinir senha</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
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
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
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
  },
});
