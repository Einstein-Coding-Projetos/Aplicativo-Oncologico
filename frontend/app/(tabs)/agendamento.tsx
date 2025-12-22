import { View, Text, StyleSheet, Button } from "react-native";
import { router } from "expo-router"; 

export default function AgendamentoScreen() {
  
  const handleNavigation = () => {
    router.push("../screens/PsicologoScreen"); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Agendamento</Text>
      
      <Text style={styles.subtitle}>Consultas agendadas:</Text>

      <Button
        title="Agendar nova consulta"
        onPress={handleNavigation} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fbfd",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f7a8c",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#5c6b73",
    textAlign: "center",
  },
});
