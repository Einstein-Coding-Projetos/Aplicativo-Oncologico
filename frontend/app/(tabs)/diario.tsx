import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

type Entrada = {
  id: string;
  data: string;
  conteudo: string;
};

export default function DiarioScreen() {
  const [texto, setTexto] = useState('');
  const [entradas, setEntradas] = useState<Entrada[]>([]);

  function salvar() {
    if (!texto.trim()) {
      Alert.alert('Ops!', 'Escreva algo antes de salvar.');
      return;
    }

    const hoje = new Date().toISOString().split('T')[0];

    const novaEntrada: Entrada = {
      id: Math.random().toString(),
      data: hoje,
      conteudo: texto,
    };

    setEntradas([novaEntrada, ...entradas]);
    setTexto('');

    Alert.alert('Salvo!', `Seu diário de ${hoje} foi salvo.`);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Diário</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Escreva aqui como foi seu dia..."
        placeholderTextColor="#9CA3AF"
        multiline
        value={texto}
        onChangeText={setTexto}
      />

      <TouchableOpacity style={styles.botao} onPress={salvar}>
        <Text style={styles.botaoTexto}>Salvar</Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 20 }}>
        {entradas.map((e) => (
          <View key={e.id} style={styles.card}>
            <Text style={styles.data}>{e.data}</Text>
            <Text style={styles.conteudo}>{e.conteudo}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    height: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
    color: '#1F2937',
    // Shadow matching Perfil cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  botao: {
    backgroundColor: '#4338ca',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#4338ca",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  data: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4F46E5',
    fontSize: 14,
  },
  conteudo: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});
