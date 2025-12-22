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
        placeholderTextColor="#4A6FA5"
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
    backgroundColor: '#D7EAFE',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A3B5D',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    height: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  data: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1A3B5D',
  },
  conteudo: {
    fontSize: 16,
    color: '#333',
  },
});
