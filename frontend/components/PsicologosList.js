
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { dadosPsicologos } from "../app/data/dadosPsicologos"; 

const PsicologosList = () => {

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity>
        <View style={styles.card}>
            <Text style={styles.nome}>{item.nome}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
       <FlatList 
          data={dadosPsicologos} 
          keyExtractor={(item) => item.id} 
          renderItem={renderItem} 
       />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Garante que a lista ocupe a tela
    padding: 20,
    backgroundColor: '#fff',
  },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "black"
  }
});

export default PsicologosList;

