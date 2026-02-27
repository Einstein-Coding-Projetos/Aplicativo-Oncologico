import { StyleSheet, Text, View, Pressable, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { useState, useMemo, useEffect, useCallback } from 'react';

import api from '@/lib/api';

import { SafeAreaView } from 'react-native-safe-area-context';

interface Appointment {

  id: string;

  profissional: string;

  date: string;

  horario: string;

  status: string;

}


export default function ConsultasPassadas() {

  const handleNavigation = () => {

    router.push("/psicologo");

  };

  const colorScheme = useColorScheme();
  const router = useRouter();
 
  const [loading, setLoading] = useState(true);
  const [Consultas, setConsultas] = useState<Appointment[]>([]);

  const load = useCallback(async () => {
      try {
        setLoading(true);
      const dados = await api.fetchConcluidas(); // Chama a função nova
      setConsultas(dados);
      setLoading(false);
      setConsultas(dados.filter((a: any) => a.status == 'concluido'));

      }catch (err) {
        console.warn('Falha em carregar consultas', err)}}, []);
       

  useEffect(() => {

    load();

  }, [load]);

   const renderItem = ({ item }: { item: Appointment }) => {
    let dataFormatada = item.date;
    
    if (item.date && typeof item.date === 'string') {
        // 1. Remove qualquer sujeira de hora (T00:00...)
        const dataLimpa = item.date.split('T')[0];
        // 2. Quebra em Ano, Mês, Dia
        const partes = dataLimpa.split('-');
        
        // Só formata se tiver as 3 partes (YYYY-MM-DD)
        if (partes.length === 3) {
            const [ano, mes, dia] = partes;
            dataFormatada = `${dia}/${mes}/${ano}`;
        }
    };

  

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      
                <Text style={[styles.appointmentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
      
                  {item.profissional}
      
                </Text>
      
               <Text style={styles.nextBadge}>Concluída</Text>
      
              </View>
      
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 4 }}>
      
              Horário: {item.horario} 
            </Text>
      
              <Text style={[styles.appointmentDate, { color: Colors[colorScheme ?? 'light'].text }]}>
      
                {dataFormatada}
      
              </Text>

    </View>
    
  );
  
}

  const confirmarLimpezaGeral = async () => {
    Alert.alert(
      "Atenção",
      "Deseja limpar todas as consultas passadas? Essa ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sim, Limpar Tudo",
          style: "destructive",
          onPress: async () => {
            const sucesso = await api.deleteAllHistory();
            if (sucesso) {
              setConsultas([]);
              Alert.alert("Sucesso", "Histórico apagado!");
            } else {
              Alert.alert("Erro", "Não foi possível limpar o histórico.");
            }
          }
        }
      ]
    );
  };

return (
     <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
    <>
    
      <Pressable style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint, marginTop: 20 }]} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Voltar</Text>


            </Pressable>
            

              <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
    
                Consultas passadas
    
              </Text>
    
    
    
            
             
              <FlatList
                data={Consultas}
    
                renderItem={renderItem}
    
                keyExtractor={(item) => item.id}
    
                style={styles.appointmentList}
    
                scrollEnabled={true}
    
              />

    <TouchableOpacity  style={styles.btnLimparTudo}   onPress={confirmarLimpezaGeral}>

          <Text style={styles.textoLimpar}>Limpar Histórico</Text>
        </TouchableOpacity>
    
              <Pressable
    
                style={[styles.floatingButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
    
                onPress={handleNavigation}
    
              >
    
                <Text style={styles.floatingButtonText}>+</Text>
    
              </Pressable>
    
    

    
            </>
    
          
    
        </SafeAreaView>
    
      );
    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  btnLimparTudo: {
    backgroundColor: '#FF3B30', // Vermelho alerta
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    gap: 8, // Espaço entre ícone e texto
    elevation: 3, // Sombra no Android
  },
  textoLimpar: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  floatingButton: {

    position: 'absolute',

    bottom: 100,

    right: 20,

    width: 60,

    height: 60,

    borderRadius: 30,

    alignItems: 'center',

    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.25,

    shadowRadius: 3.84,

    elevation: 5,

  },
  appointmentList: {

    flex: 1,

    width: '100%',

    marginBottom: 20,

  },
  floatingButtonText: {

    color: '#fff',

    fontSize: 32,

    fontWeight: 'bold',

  },
  appointmentTitle: {

    fontSize: 16,

    fontWeight: '600',

    marginBottom: 5,

  },
  appointmentDate: {

    fontSize: 14,

    opacity: 0.7,

  },
  nextBadge: {

    backgroundColor: '#1f7a8c',

    color: '#fff',

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 8,

    overflow: 'hidden',

    fontSize: 12,

    fontWeight: '600',

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
