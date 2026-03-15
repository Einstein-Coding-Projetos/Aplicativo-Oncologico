import { Stack } from 'expo-router';

export default function PsicologoLayout() {
  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: '#070F21' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Stack.Screen name="index" options={{ title: 'Minha Agenda' }} />
      <Stack.Screen name="ajustar" options={{ title: 'Liberar Horários' }} />
    </Stack>
  );
}