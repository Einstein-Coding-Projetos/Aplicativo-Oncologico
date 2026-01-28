import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { dadosPsicologos } from "../app/data/dadosPsicologos";
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configuração do idioma (
LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul.', 'Ago', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: "Hoje"
};
LocaleConfig.defaultLocale = 'br';

const PsicologosList = () => {
  const [idAberto, setIdAberto] = useState(null);
  const [dataAberto, setdataAberto] = useState(null);
  // Estado auxiliar para guardar as datas calculadas de cada psicólogo
  const [datasCalculadas, setDatasCalculadas] = useState([]); 
  const [horariosAgendados, setHorariosAgendados]= useState([])

  // Mapeamento de String para Index do JavaScript (0 = Domingo, 1 = Segunda...)
  const mapaDiasSemana = {
    'Domingo': 0,
    'Segunda': 1,
    'Terça': 2,
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5,
    'Sábado': 6
  };

  // Converte "Segunda, Quarta" em datas reais (YYYY-MM-DD)
  const calcularDatasFuturas = (diasDaSemanaArray) => {
    let datasValidas = [];
  // Pega a data e hora exata de AGORA
    let hoje = new Date();
    
    
    for (let i = 0; i < 60; i++) {
      let dataFutura = new Date(); //transforma a variável dataFutura como data 
      dataFutura.setDate(hoje.getDate() + i); //sempre será atualizado ao mudar o dia, hoje + 60 dias

      let diaSemanaIndex = dataFutura.getDay(); // atribui um dia da semana (0 a 6) para uma dataFutura

      // Verifica se o índice do dia atual bate com algum dia da lista do psicólogo
      // Ex: Se hoje é Segunda (1) e o médico atende ['Segunda'], entra no if.
      const atendeHoje = diasDaSemanaArray.some(diaString => mapaDiasSemana[diaString] === diaSemanaIndex); // verifica se os dias da semana dos próximos 60 dias batme com algum dia da semana do médico (transformado em número)

      if (atendeHoje) {
        // se bater ele cria três constantes para visulizar a data 
        const ano = dataFutura.getFullYear();
        const mes = String(dataFutura.getMonth() + 1).padStart(2, '0'); //string: nome do mês; pegar o número do mês + 1, pois janeiro é zero; o padStart garante que o mês seja escrito com dois dígitos 
        const dia = String(dataFutura.getDate()).padStart(2, '0');
        datasValidas.push(`${ano}-${mes}-${dia}`);
      }
    }
    return datasValidas;
  };

  const confirmarAgendamento = async (dia, horario, item) => {
    console.log("Iniciando agendamento...");

    const novoAgendamento = {
        psicologo: item ? item.nome: "Nome Desconhecido",
        dia: dia,
        horario: horario
    };

    //colocar seu ip
    try {
        const resposta = await fetch('http://ip:8000/agendar', {
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

  const gerarMarkedDates = (datasDisponiveis, diaSelecionado) => {
    let marcados = {};
    
    //adiciona um mini marcação nos dias disponíveis de cada psicólogo
    datasDisponiveis.forEach(dataString => {
      marcados[dataString] = { 
        marked: true, 
        dotColor: '#4395e2ff',
        activeOpacity: 0
      };
    });
    
    //adiciona uma marcação azul no dia selecionado
    if (diaSelecionado) {
      marcados[diaSelecionado] = {
        ...marcados[diaSelecionado], // Mantém o dot se já existir
        selected: true,
        selectedColor: '#4395e2ff',
        selectedTextColor: 'white'
      };
    }
    return marcados;
  };

  const abrirCard = async (item) => {
    if (item.id === idAberto) {
      setIdAberto(null); //se o card já está aberto, ele fecha
      setDatasCalculadas([]); // Limpa
      setHorariosAgendados([]);
    } else { 
      // se não esta aberto, vai abrir     
      setHorariosAgendados([]);
      setdataAberto(null); // Fecha o dia selecionado ao trocar de médico
      setIdAberto(item.id); //defini que esse card está aberto agora

      const datasReais = calcularDatasFuturas(item.dias); //define os dias transformados em números 
      setDatasCalculadas(datasReais); //armazena essas datas

      //colocar seu ip
      try {
        const nomeSeguro = encodeURIComponent(item.nome);
        const resposta = await fetch(`http://ip:8000/horarios-ocupados/${nomeSeguro}`);
        
        if (resposta.ok) {
            const dadosBrutos = await resposta.json();
            console.log("--------------------------------");
console.log("Médico pesquisado:", item.nome);
console.log("O que o banco encontrou:", dadosBrutos);
console.log("--------------------------------");
            
            // --- A MÁGICA ACONTECE AQUI ---
            // Vamos criar uma nova lista limpa, garantindo que o horário tenha só 5 letras (00:00)
            const dadosLimpos = dadosBrutos.map(item => ({
                date: item.date,                 // Mantém a data
                horario: item.horario.substring(0, 5) // Corta "14:00:00" para "14:00"
            }));

            console.log("Horários ocupados (Limpos):", dadosLimpos); // Para você conferir no terminal
            setHorariosAgendados(dadosLimpos); 
        }
      } catch (error) {
        console.error("Erro ao buscar horários ocupados:", error);
      }
    }
  };

  const renderItem = ({ item }) => {
    const estaAberto = item.id === idAberto; //define que o estaAberto ocorrerá quando o card estiver aberto
// quando apertar no nome irá para a função abrirCard

    return ( 
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => abrirCard(item)}
        >
          <Text style={styles.nome}>{item.nome}</Text> 
        </TouchableOpacity>

        {estaAberto && ( //quando estiver aberto, aparecerá os dias disponíveis 
          <View>
            <Text style={styles.subtitle}>
              Atende às: {item.dias.join(', ')} 
            </Text>
            
            <Calendar
              current={new Date().toISOString().split('T')[0]} // Foca o calendário no dia de hoje (determina que as datas passadas sejam em relação à hj)
              minDate={new Date().toISOString().split('T')[0]} // Bloqueia datas passadas
              
              // Quando um dia é clicado, se está na lista seleciona o dia 
              onDayPress={day => {
                if (datasCalculadas.includes(day.dateString)) {
                  setdataAberto(day.dateString);
                } else {
                  Alert.alert("Indisponível", "Este profissional não atende neste dia da semana.");
                  setdataAberto(null);
                }
              }}
              
              // Usando a função definida antes, mas para os dados que temos 
              markedDates={gerarMarkedDates(datasCalculadas, dataAberto)}
              
              theme={{
                todayTextColor: '#4395e2ff',
                arrowColor: '#4395e2ff',
                textDayFontWeight: 'bold',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold'
              }}
            />
{/* Map cria um botão para cada horário disponível */}
{/* Linha 179: Formata a data de 2023-10-30 para 30/10/2023 */}
{/* Linha 185: Apresenta um alerta quando é escolhido um horário, se clicado sim vai para a função confirmarAgendamento */}

            {dataAberto && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.subtitle}>Horários para {dataAberto.split('-').reverse().join('/')}:</Text> 
                <View style={styles.horariosContainer}>
                  
                  {item.horarios.map((horario, hIndex) => {
                    // Verifica se o horário está na lista de ocupados
                    const estaOcupado = horariosAgendados.some(agendamento => 
                        agendamento.date === dataAberto && agendamento.horario === horario
                    );

                    return ( 
                        <TouchableOpacity 
                            style={[
                                styles.btnHorario,
                                // Se estiver ocupado, pinta de cinza
                                estaOcupado && { backgroundColor: '#e0e0e0', borderColor: '#ccc' }
                            ]} 
                            key={hIndex} 
                            disabled={estaOcupado} // Bloqueia o clique
                            onPress={() => {
                                Alert.alert("Confirmar", `Agendar dia ${dataAberto} às ${horario}?`, [
                                    {text: "Cancelar"},
                                    {text: "Sim", onPress: () => confirmarAgendamento(dataAberto, horario, item)}
                                ]);
                            }}
                        >
                            <Text style={[
                                styles.textoHorario,
                                // Se estiver ocupado, texto cinza
                                estaOcupado && { color: '#999' }
                            ]}>
                                {estaOcupado ? "Ocupado" : horario}
                            </Text>
                        </TouchableOpacity>
                    );
                  })}

                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };
 
return (
    <View style={styles.mainContainer}>
      <FlatList 
        data={dadosPsicologos} 
        keyExtractor={(item) => item.id} 
        renderItem={renderItem} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 10, backgroundColor: '#fff' },
  card: { padding: 15, marginBottom: 10, backgroundColor: '#4395e2ff', borderRadius: 8, elevation: 3 },
  nome: { fontSize: 18, fontWeight: 'bold', color: "white" },
  subtitle: { fontSize: 16, color: "#5c6b73ff", textAlign: "center", marginBottom: 10, marginTop: 10 },
  horariosContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  btnHorario: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, borderWidth: 1, borderColor: '#4395e2ff', marginBottom: 10 },
  textoHorario: { color: '#4395e2ff', fontWeight: 'bold' }
});

export default PsicologosList;