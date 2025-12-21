
// Arquivo: app/psicologos.js
import React from 'react';
import { View, Text, StyleSheet, Button } from "react-native";
import { router } from "expo-router";
import PsicologosList from '../../components/PsicologosList';
import { SafeAreaView } from 'react-native-safe-area-context'


export default function PsicologosScreen() {
// Função para navegar
  const handleNavigation = () => {
    router.push("../(tabs)/agendamento"); 
  
  };
  
  return (
    <SafeAreaView style={styles.containerExterno}>
      <View style={styles.conteinerInterno}>
      <View style={styles.button}> 
      <Button
              title="Voltar"
              onPress={handleNavigation} 
          />
          </View>
      <Text style={styles.title}>Lista de Psicólogos - Em construção</Text>
      <View style={styles.subtitulo}>
        <Text>Selecionar as seguintes opções:</Text>
        <PsicologosList/>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerExterno: { flex: 1, padding: 20, backegroundcolor:'#fff' },
  title: { fontSize: 20, fontWeight: 'bold' },
  button: {alignSelf: 'flex-start', marginBottom:20},
  conteinerInterno: {flex:1, paddingHorizontal: 20 },
  subtitulo: {flex:1, marginTop:21}
});

