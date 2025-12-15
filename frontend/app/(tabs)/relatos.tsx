import { View, Text, StyleSheet } from "react-native";

export default function RelatosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Relatos - Em construcao</Text>
      <Text style={styles.subtitle}>
        Compartilhe experiencias e leia historias de apoio.
      </Text>
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
