import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RelatoDetalhe() {
  const router = useRouter();

  const { titulo, subtitulo, texto, fonte, data } =
    useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* BOTÃO VOLTAR */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/relatos")}
            style={styles.botaoVoltar}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#333"
            />
          </TouchableOpacity>
        </View>

        {/* CARD DO RELATO */}
        <View style={styles.card}>
          <Text style={styles.titulo}>
            {titulo}
          </Text>

          <Text style={styles.subtitulo}>
            {subtitulo}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.texto}>
            {texto}
          </Text>

          {(fonte || data) && (
            <View style={styles.footer}>
              {fonte && (
                <Text style={styles.fonte}>
                  Fonte: {fonte}
                </Text>
              )}

              {data && (
                <Text style={styles.data}>
                  {data}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },

  container: {
    padding: 20,
  },

  header: {
    marginBottom: 10,
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 26,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },

  subtitulo: {
    marginTop: 8,
    fontSize: 16,
    color: "#777",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 18,
  },

  texto: {
    fontSize: 17,
    lineHeight: 26,
    color: "#444",
  },

  footer: {
    marginTop: 24,
  },

  fonte: {
    fontSize: 14,
    color: "#888",
  },

  data: {
    fontSize: 13,
    color: "#AAA",
    marginTop: 4,
  },
});