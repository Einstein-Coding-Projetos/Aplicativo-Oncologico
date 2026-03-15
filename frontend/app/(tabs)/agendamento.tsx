import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Alert, Pressable, ScrollView, Text, View, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import api from '../../lib/api';
import { dadosPsicologos } from '../data/dadosPsicologos';

// Configuração do Calendário
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar.','Abr.','Mai.','Jun.','Jul.','Ago.','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
};
LocaleConfig.defaultLocale = 'pt-br';

const diasSemanaMap: { [key: string]: number } = {
  'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6
};

// Caminho relativo para a imagem de perfil
const imagemPerfil = require('../data/Perfil.png');

export default function AgendamentoScreen() {
  const [selectedPsicologo, setSelectedPsicologo] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupied, setOccupied] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

// Efeito para buscar horários ocupados sempre que mudar o psicólogo ou a data
  useEffect(() => {
    if (selectedPsicologo && selectedDate) {
      // Chama sua API para buscar agendamentos existentes no Neon
      api.fetchHorariosOcupados(selectedPsicologo.nome)
        .then(data => {
          // Filtra apenas os agendamentos da data que está selecionada no calendário
          const filtered = data.filter((item: any) => item.date === selectedDate);
          setOccupied(filtered);
        })
        .catch(() => setOccupied([]));
    }
  }, [selectedPsicologo, selectedDate]);

  // Estado para controlar a posição atual
  const [currentIdx, setCurrentIdx] = useState(0);

  const scrollList = (direction: 'left' | 'right') => {
    if (flatListRef.current) {
      let nextIdx = direction === 'right' ? currentIdx + 1 : currentIdx - 1;
      
      // Limites da lista (0 a 4 psicólogos)
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx >= dadosPsicologos.length) nextIdx = dadosPsicologos.length - 1;

      setCurrentIdx(nextIdx);

      // CÁLCULO PARA CENTRALIZAR:
      // 172 é a largura do card + gap.
      // O ajuste de 80px (metade da largura do card) ajuda a posicionar no centro da tela do emulador.
      const cardWidthComGap = 172;
      const targetOffset = (nextIdx * cardWidthComGap) - 80; 
      
      (flatListRef.current as any).scrollTo({ 
        x: Math.max(0, targetOffset), // Garante que não role para números negativos
        animated: true 
      });
    }
  };

  const markedDates = useMemo(() => {
    if (!selectedPsicologo) return {};
    let dates: any = {};
    const start = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(start.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dayIndex = date.getDay();
      const isAvailable = selectedPsicologo.dias.some((d: string) => diasSemanaMap[d] === dayIndex);
      if (isAvailable) {
        dates[dateString] = {
          disabled: false,
          customStyles: {
            container: { backgroundColor: dateString === selectedDate ? '#0B63F6' : '#1E293B', borderRadius: 8 },
            text: { color: 'white', fontWeight: 'bold' }
          }
        };
      } else {
        dates[dateString] = { disabled: true, disableTouchEvent: true, opacity: 0.2 };
      }
    }
    return dates;
  }, [selectedPsicologo, selectedDate]);

  useEffect(() => {
    if (selectedPsicologo) {
      api.fetchHorariosOcupados(selectedPsicologo.nome).then(setOccupied);
    }
  }, [selectedPsicologo]);

  const handleConfirmAction = async () => {
    try {
      setIsSubmitting(true);
      await api.createAppointment({
        profissional: selectedPsicologo.nome,
        date: selectedDate!,
        horario: selectedTime!,
      });
      Alert.alert("Sucesso", "Seu agendamento foi salvo e aparecerá na sua Agenda!");
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error: any) {
      Alert.alert("Erro de Conexão", "Verifique se o Docker está rodando corretamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Título Original */}
        <View className="relative overflow-hidden rounded-md border border-[#2A3C60] bg-[#0E1A33] p-4 mb-6">
          <View className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-blue-500/30" />
          <View className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-orange-500/30" />
          <Text className="text-2xl font-bold text-white">Agendamento</Text>
          <Text className="mt-1 text-sm text-blue-100">Fluxo rápido para marcar seu atendimento.</Text>
        </View>

        {/* 1. Seleção de Psicólogo */}
        <Text className="text-cyan-100 font-semibold mb-3 text-sm">1. Escolha o Psicólogo</Text>
        
        {/* Container com Setas e ScrollView Manual */}
        <View className="flex-row items-center mb-6">
    <Pressable onPress={() => scrollList('left')} className="p-2">
      <Ionicons name="chevron-back-circle" size={36} color="#5CC8FF" />
    </Pressable>

    <ScrollView 
      horizontal 
      ref={flatListRef as any}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={true} // Permite que o usuário também arraste se quiser
      decelerationRate="fast"
      contentContainerStyle={{ gap: 12, paddingHorizontal: 10, paddingRight: 100 }}
    >
      {dadosPsicologos.map((psi) => {
        const active = selectedPsicologo?.id === psi.id;
        return (
          <Pressable 
            key={psi.id}
            onPress={() => { 
              setSelectedPsicologo(psi); 
              setSelectedDate(null); 
              setSelectedTime(null); 
            }}
            className="p-4 rounded-xl border items-center justify-center w-40 h-[145px]"
            style={{
              borderColor: active ? '#0B63F6' : '#324669',
              backgroundColor: active ? 'rgba(11, 99, 246, 0.2)' : '#0F1F3D',
            }}
          >
            <Image 
              source={imagemPerfil} 
              style={{ width: 52, height: 52, borderRadius: 26, marginBottom: 8 }} 
            />
            <Text className="text-white font-bold text-center text-[13px]" numberOfLines={1}>
              {psi.nome}
            </Text>
            <Text className="text-slate-400 text-[10px] text-center" numberOfLines={1}>
              {psi.especialidade}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>

    <Pressable onPress={() => scrollList('right')} className="p-2">
      <Ionicons name="chevron-forward-circle" size={36} color="#5CC8FF" />
    </Pressable>
  </View>

        {/* 2. Calendário */}
        {selectedPsicologo && (
          <View className="bg-[#0F1F3D] rounded-xl p-2 mt-2 border border-[#324669]">
             <Text className="text-cyan-100 font-semibold p-2 text-sm">2. Selecione uma Data</Text>
             <Calendar
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: '#5CC8FF',
                dayTextColor: '#D2DDF2',
                todayTextColor: '#5CC8FF',
                selectedDayBackgroundColor: '#0B63F6',
                monthTextColor: '#fff',
                arrowColor: '#5CC8FF',
                disabledDayTextColor: '#2F3D57',
              }}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              markingType={'custom'}
              minDate={new Date().toISOString().split('T')[0]}
            />
          </View>
        )}

        {/* 3. Horários com Lógica de "Ocupado" */}
        {selectedDate && (
           <View className="bg-[#0F1F3D] p-4 mt-6 rounded-xl border border-[#324669]">
             <Text className="text-cyan-100 font-semibold mb-4 text-sm">3. Horários Disponíveis</Text>
             <View className="flex-row flex-wrap gap-2">
               {selectedPsicologo.horarios.map((time: string) => {
                 // Verifica se este horário específico está na lista de ocupados do banco
                 const isOccupied = occupied.some(slot => slot.horario === time);

                 return (
                   <Pressable
                     key={time}
                     disabled={isOccupied} // Impede o clique se estiver ocupado
                     onPress={() => setSelectedTime(time)}
                     className="px-4 py-2 rounded-lg border"
                     style={{
                       backgroundColor: isOccupied ? '#1A263F' : selectedTime === time ? '#EA580C' : '#0F1F3D',
                       borderColor: isOccupied ? '#2F3D57' : selectedTime === time ? '#EA580C' : '#324669',
                       opacity: isOccupied ? 0.5 : 1
                     }}
                   >
                     <Text 
                        className="font-medium" 
                        style={{ color: isOccupied ? '#4E638C' : '#D2DDF2' }}
                     >
                       {isOccupied ? 'Ocupado' : time}
                     </Text>
                   </Pressable>
                 );
               })}
             </View>
           </View>
        )}

        {/* 4. RESUMO E CONFIRMAÇÃO (Bloco Reintegrado) */}
        {selectedTime && (
          <View className="mt-6 rounded-md border border-[#324669] bg-white/10 p-4">
            <Text className="text-sm font-semibold text-cyan-100">Resumo do Agendamento</Text>
            <Text className="mt-2 text-sm text-slate-100">Profissional: {selectedPsicologo.nome}</Text>
            <Text className="text-sm text-slate-100">Data: {selectedDate?.split('-').reverse().join('/')}</Text>
            <Text className="text-sm text-slate-100">Horário: {selectedTime}</Text>

            <Pressable
              className="mt-4 rounded-md py-3"
              style={{ backgroundColor: '#0B63F6' }}
              onPress={() => Alert.alert(
                "Confirmar Agendamento",
                `Deseja confirmar sua consulta com ${selectedPsicologo.nome}?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Confirmar", onPress: handleConfirmAction }
                ]
              )}
              disabled={isSubmitting}
            >
              <Text className="text-center font-semibold text-white">
                {isSubmitting ? 'Processando...' : 'Confirmar Agendamento'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}