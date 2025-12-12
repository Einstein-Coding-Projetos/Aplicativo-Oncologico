
// Arquivo: app/psicologos.js
import React from 'react';
import { View, Text, StyleSheet, Button } from "react-native";
import { router } from "expo-router";
import PsicologosList from '../../components/PsicologosList';


export default function PsicologosScreen() {
// Função para navegar
  const handleNavigation = () => {
    router.push("../(tabs)/agendamento"); 
  };

  return (
    <View style={styles.container}>
    <Button
            title="Voltar"
            onPress={handleNavigation} 
          />
      <Text style={styles.title}>Lista de Psicólogos - Em construção</Text>
      <View style={styles.subtitle}>
        <Text>Selecionar as seguintes opções:</Text>
        <PsicologosList/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { marginTop: 10 }
});

