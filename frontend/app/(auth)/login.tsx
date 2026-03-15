import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { router } from 'expo-router';
import api from '../../lib/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setLoading(true);
  try {
    await api.login(username.trim(), password);
    
    // Buscamos o perfil completo para saber quem é o usuário
    const userData = await api.fetchUserProfile();
    console.log("Usuário logado é staff?", userData.is_staff);

    if (userData.is_staff === true) {
      router.replace('/(psicologo)'); // Manda para a pasta do psicólogo
    } else {
      router.replace('/(tabs)/diario'); // Manda para a pasta do paciente
    }
  } catch (e) {
    Alert.alert('Erro', 'Verifique suas credenciais.');
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Gradatim</Text>
        
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
          placeholder="Senha" 
          placeholderTextColor="#9FB2D8"
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F21' },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#EAF4FF', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#2E4D79', borderRadius: 10, padding: 14, marginBottom: 16, color: '#F0F7FF', backgroundColor: '#10213F' },
  button: { backgroundColor: '#0B63F6', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#7DD3FC', textAlign: 'center', marginTop: 20 },
});