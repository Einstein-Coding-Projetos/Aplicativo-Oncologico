import React, {useState} from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { dadosPsicologos } from "../app/data/dadosPsicologos"; 
import { SafeAreaView } from 'react-native-safe-area-context'



const PsicologosList = () => {
   const [idAberto, setIdAberto] = useState(null);
   const [dataAberto, setdataAberto]=useState(null);

  const confirmarAgendamento = async (dia, horario, item) => {
    console.log("Iniciando agendamento...");

    const novoAgendamento = {
        psicologo: item ? item.nome: "Nome Desconhecido",
        dia: dia,
        horario: horario
    };

    try {
        const resposta = await fetch('http://192.168.0.185:3000/agendar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoAgendamento),
        });

        if (resposta.ok) {
            Alert.alert("Sucesso", "Agendamento realizado!");
        } else {
            const erro = await resposta.text();
            Alert.alert("Erro", "Falha ao agendar: " + erro);
        }

    } catch (error) {
        console.log("Erro de conexão:", error);
        Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  const renderItem = ({ item }) => {
    const estaAberto = item.id === idAberto;

    return (
        
      <View style={styles.container}>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => { setIdAberto(estaAberto ? null : item.id); setdataAberto(null); }}
        >
          <Text style={styles.nome}>{item.nome}</Text>
        </TouchableOpacity>

        {estaAberto && (
          <View >
            <Text style={styles.subtitle}>Disponibilidade:</Text>
            <View>
              {item.dias.map((dia, index) => {
            const  DataAberto = dia ===dataAberto

              return (                
                <View key={index}>
                  
                  <TouchableOpacity 
                    style={styles.countContainer} 
                    onPress={() => { setdataAberto(DataAberto ? null : dia); }}
                  >
                    <Text>{dia}</Text>
                  </TouchableOpacity>

                  {DataAberto && (
                    <View>
                      <Text style={styles.subtitle}>Horários:</Text>
                      <View>
                         {item.horarios.map((horarios, hIndex) => (
                            <TouchableOpacity style={styles.btnHorario} key={hIndex} onPress={() => {
                              console.log(`Clicou em: ${horarios}`); 
                              Alert.alert("Tem certeza?", `Você escolheu ${dia} às ${horarios} com o/a ${item.nome}`, 
                              [{text:"Cancelar", style: "cancel", onPress:()=> console.log("Cancelado")}, 
                                {text: "Agendar",style: "default", onPress: () => confirmarAgendamento(dia, horarios, item) }])}}>
                              <Text>{horarios}</Text>
                            </TouchableOpacity>
                         ))}
                      </View>
                    </View>
                  )}

                </View>
              )})}
            </View>
          </View>
        )}

      </View>
      
    );
  };
  

  return (
    <View style={styles.container}>
       <FlatList 
          data={dadosPsicologos} 
          keyExtractor={(item) => item.id} 
          renderItem={renderItem} 
       />
    </View>
  )
};

const styles = StyleSheet.create({
  btnHorario: {
    backgroundColor: '#fff',
    paddingVertical: 10,   // Aumenta a área de toque vertical
    paddingHorizontal: 15, // Aumenta a área de toque horizontal
    margin: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 2, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2
  },
  container: {
    flex: 1, // Garante que a lista ocupe a tela
    padding: 10,
    backgroundColor: '#fff',
  },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#4395e2ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "black"
  },
  countContainer: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#acc4ceff',

},
subtitle: {
    fontSize: 15,
    color: "#5c6b73ff",
    textAlign: "center",
  },
  button: {
    alignSelf: 'flex-start', 
    marginBottom:20
  },
});
export default PsicologosList;



