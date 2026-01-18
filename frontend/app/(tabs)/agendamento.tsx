
import { StyleSheet, Text, View, Pressable, FlatList } from 'react-native';

import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { useState, useMemo, useEffect, useCallback } from 'react';

import api from '@/lib/api';

import { SafeAreaView } from 'react-native-safe-area-context';


//o que um Appointement tem que necessariamente ter 
interface Appointment {

  id: string;

  profissional: string;

  date: string;

  horario: string;

  status: string;

}


export default function AgendamentoScreen() {

  const colorScheme = useColorScheme();

  const router = useRouter();



  const handleNavigation = () => {

    router.push("../screens/PsicologoScreen");

  };

 

  // Lista de consultas marcadas (vazia por padrão)
  //setAppointments atualiza a lista 

  const [appointments, setAppointments] = useState<Appointment[]>([]);

 

  // Função para adicionar uma consultan: tentar criar no backend uma consulta e se der certo recarrega 

  const addAppointment = async (profissional: string, date: string, horario: string) => {

    try {

      // create on backend

      const created = await api.createAppointment({ profissional, date, horario});

    await load();

      // update local list

setAppointments((prev) => [{

  ...created,

  profissional: `Consulta com ${profissional}`, // Garante que tenha título

  status: 'agendado' // Garante que tenha status

} as any, ...prev]);    } catch (err) {

      console.error(err);

      // fallback: optimistic local add


      setAppointments((prev) => [{

        id: Date.now().toString(),

        profissional: `Consulta com ${profissional}`, // Título provisório

        horario,

        date,

        status: 'agendado'

      } as any, ...prev]);

    }

  };


//filtra os marcados como concluídos 
  

  const load = useCallback(async () => {
    try {
      const data = await api.fetchAppointments();
      
      setAppointments(data.filter((a: any) => a.status !== 'concluido'));
      
    } catch (err) {
      console.warn('Falha em carregar consultas', err);
    }
  }, []);

  // Ordena consultas por data (mais próxima primeiro)

  const sortedAppointments = useMemo(() => {

    return [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [appointments]);



  // carregar do backend ao montar

  useEffect(() => {

    load();

  }, [load]);



  // Verifica se há consultas, se há mais que zero, ele mostra a lista, se tem zero, ele mostra a página inicial com os três botões

  const hasAppointments = sortedAppointments.length > 0;



  // Próxima consulta

  const nextAppointment = sortedAppointments.length > 0 ? sortedAppointments[0] : undefined;



  const renderAppointment = ({ item }: { item: Appointment }) => {

    const isNext = nextAppointment ? item.id === nextAppointment.id : false;

    let dataFormatada = item.date;
    
    // Se a data existir e for uma string
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
    }


    return (

      <View

        style={[

          styles.appointmentItem,

          { borderColor: Colors[colorScheme ?? 'light'].tint },

          isNext && styles.nextAppointment,

        ]}

      >

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

          <Text style={[styles.appointmentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>

            {item.profissional}

          </Text>

          {isNext && <Text style={styles.nextBadge}>Próxima</Text>}

        </View>

        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 4 }}>

        Horário: {item.horario} 
      </Text>

        <Text style={[styles.appointmentDate, { color: Colors[colorScheme ?? 'light'].text }]}>

          {dataFormatada}

        </Text>

        {/* Show a manual 'Mark completed' button when not completed */}

        {item.status !== 'concluído' && (

          <Pressable

            style={[styles.completeButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint, marginTop: 10 }]}

            onPress={async () => {

              try {

                await api.completeAppointment(Number(item.id));

                // refresh lists

                await load();

              } catch (e) {

                console.warn('Falha em marcá-lo como concluído', e);

              }

            }}

          >

            <Text style={styles.buttonText}>Marcar como concluída</Text>

          </Pressable>

        )}

      </View>

    );

  };



  return (

    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>

      {!hasAppointments ? (

        // Layout quando NÃO há consultas (botões centralizados)

        <>

          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>

            Agendamentos

          </Text>

          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>

            Gerencie suas consultas médicas aqui

          </Text>

         

          <Pressable

            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}

            onPress={handleNavigation}

          >

            <Text style={styles.buttonText}>Novo Agendamento</Text>

          </Pressable>



          <Pressable

            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint, marginTop: 20 }]}

            onPress={() => router.push('/consultas_passadas')}

          >

            <Text style={styles.buttonText}>Consultas Passadas</Text>

          </Pressable>



          {process.env.NODE_ENV === 'development' && (

            <Pressable

              style={[styles.button, { backgroundColor: '#9980fcf1', marginTop: 20 }]}

              onPress={() => addAppointment('Dr.Consulta teste', new Date(Date.now() + 24 * 3600 * 1000).toISOString(), '09:00')}

            >

              <Text style={styles.buttonText}>Consultas Agendadas</Text>

            </Pressable>

          )}

        </>

      ) : (

        // Layout quando HÁ consultas (botões no canto inferior direito)

        <>

     

          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>

            Suas Consultas

          </Text>

         

          <FlatList

            data={sortedAppointments}

            renderItem={renderAppointment}

            keyExtractor={(item) => item.id}

            style={styles.appointmentList}

            scrollEnabled={true}

          />



          <Pressable

            style={[styles.floatingButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}

            onPress={handleNavigation}

          >

            <Text style={styles.floatingButtonText}>+</Text>

          </Pressable>



          <Pressable

            style={[styles.floatingButtonSecondary, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}

            onPress={() => router.push('/consultas_passadas')}

          >

            <Text style={styles.floatingButtonText}>📋</Text>

          </Pressable>

        </>

      )}

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    padding: 20,

  },

  title: {

    fontSize: 24,

    fontWeight: 'bold',

    marginBottom: 30,

    paddingVertical: 20,

    alignSelf: 'center'

  },

  subtitle: {

    fontSize: 16,

    opacity: 0.7,

    marginBottom: 30,

  },

  button: {

    paddingHorizontal: 24,

    paddingVertical: 12,

    borderRadius: 8,

    alignSelf: 'center',

  },

  buttonText: {

    color: '#fff',

    fontSize: 16,

    fontWeight: '600',

  },

  backButton: {

    position: 'absolute',

    top: 20,

    left: 20,

    padding: 10,

    paddingVertical: 12

   

  },

  backButtonText: {

    fontSize: 16,

    fontWeight: '600',

  },

  completeButton: {

    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 8,

    alignSelf: 'flex-start',

  },

  appointmentList: {

    flex: 1,

    width: '100%',

    marginBottom: 20,

  },

  appointmentItem: {

    padding: 15,

    marginBottom: 10,

    borderLeftWidth: 4,

    borderRadius: 8,

    backgroundColor: 'rgba(0, 0, 0, 0.05)',

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

  nextAppointment: {

    backgroundColor: 'rgba(31,122,140,0.06)',

    borderLeftWidth: 4,

    borderRadius: 8,

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

  floatingButtonSecondary: {

    position: 'absolute',

    bottom: 30,

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

  floatingButtonText: {

    color: '#fff',

    fontSize: 32,

    fontWeight: 'bold',

  },

});