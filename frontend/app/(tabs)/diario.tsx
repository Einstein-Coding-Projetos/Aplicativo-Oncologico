import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

type Dia = {
  data: string;
  humor?: number;
  texto?: string;
};

function gerarTrilha(dias = 14): Dia[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    return { data: d.toISOString().split("T")[0] };
  });
}

function corDoHumor(h?: number) {
  if (h === undefined) return "#E5E7EB";
  if (h < 30) return "#EF4444";
  if (h < 60) return "#F59E0B";
  if (h < 85) return "#22C55E";
  return "#16A34A";
}

function hojeISO() {
  return new Date().toISOString().split("T")[0];
}

export default function DiarioScreen() {
  const [trilha, setTrilha] = useState<Dia[]>(gerarTrilha());
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [humor, setHumor] = useState(50);
  const [texto, setTexto] = useState("");
  const [diaVisualizado, setDiaVisualizado] = useState<Dia | null>(null);

  const animacao = useRef(new Animated.Value(0)).current;

  function abrirDia(dia: Dia) {
    setDiaVisualizado(dia);
    animacao.setValue(0);

    Animated.timing(animacao, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  function salvar() {
    if (!diaSelecionado) return;

    if (!texto.trim()) {
      Alert.alert("Atenção", "Escreva algo sobre o seu dia ✍️");
      return;
    }

    setTrilha((prev) =>
      prev.map((d) =>
        d.data === diaSelecionado ? { ...d, humor, texto } : d
      )
    );

    Alert.alert("Salvo!", "Registro salvo com sucesso 💜");
  }

  function isFuturo(data: string) {
    return data > hojeISO();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* MODAL COM ZOOM */}
      <Modal visible={!!diaVisualizado} transparent animationType="none">
        {diaVisualizado && (
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: corDoHumor(diaVisualizado.humor),
                opacity: animacao,
                transform: [
                  {
                    scale: animacao.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.dataOverlay}>
              {new Date(diaVisualizado.data).toLocaleDateString("pt-BR")}
            </Text>

            <Text style={styles.emojiOverlay}>
              {diaVisualizado.humor! < 30
                ? "😞"
                : diaVisualizado.humor! < 60
                ? "😐"
                : diaVisualizado.humor! < 85
                ? "😊"
                : "😁"}
            </Text>

            <Text style={styles.textoOverlay}>
              {diaVisualizado.texto}
            </Text>

            <TouchableOpacity
              style={styles.fechar}
              onPress={() => setDiaVisualizado(null)}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Fechar</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Modal>

      <Text style={styles.titulo}>Diário Emocional</Text>

      {/* HUMOR */}
      <View style={styles.humorBox}>
        <Text style={styles.emoji}>
          {humor < 30 ? "😞" : humor < 60 ? "😐" : humor < 85 ? "😊" : "😁"}
        </Text>

        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={humor}
          onValueChange={setHumor}
        />
      </View>

      {/* TEXTO */}
      <View style={styles.textoBox}>
        <Text style={styles.textoLabel}>Como foi o seu dia?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Escreva aqui..."
          multiline
          value={texto}
          onChangeText={setTexto}
        />
      </View>

      {/* SALVAR */}
      <TouchableOpacity style={styles.botao} onPress={salvar}>
        <Text style={styles.botaoTexto}>Salvar</Text>
      </TouchableOpacity>

      {/* TRILHA */}
      <ScrollView contentContainerStyle={styles.trilha}>
        {trilha.map((dia, index) => {
          const futuro = isFuturo(dia.data);
          const deslocamento = index % 2 === 0 ? -40 : 40;

          return (
            <TouchableOpacity
              key={dia.data}
              disabled={futuro}
              onPress={() => {
                if (!futuro && dia.humor !== undefined) abrirDia(dia);
                if (!futuro) setDiaSelecionado(dia.data);
              }}
              style={[
                styles.ponto,
                { backgroundColor: corDoHumor(dia.humor) },
                futuro && styles.pontoFuturo,
                { marginLeft: deslocamento },
              ]}
            >
              {futuro ? (
                <MaterialIcons name="lock" size={22} color="#9CA3AF" />
              ) : (
                <>
                  <FontAwesome5 name="paw" size={20} color="white" />
                  <Text style={styles.numeroDia}>
                    {new Date(dia.data).getDate()}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  titulo: { fontSize: 24, fontWeight: "bold", textAlign: "center" },

  humorBox: {
    marginVertical: 20,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
  },

  emoji: { fontSize: 40, textAlign: "center", marginBottom: 10 },

  textoBox: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },

  textoLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },

  textInput: {
    minHeight: 80,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },

  trilha: { alignItems: "center", paddingBottom: 40 },

  ponto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  pontoFuturo: { backgroundColor: "#E5E7EB", opacity: 0.5 },

  numeroDia: {
    position: "absolute",
    bottom: 6,
    fontSize: 11,
    color: "white",
    fontWeight: "700",
  },

  botao: {
    backgroundColor: "#4338ca",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  botaoTexto: { color: "white", fontSize: 18, fontWeight: "600" },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emojiOverlay: { fontSize: 64, marginBottom: 20 },

  textoOverlay: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 40,
  },

  dataOverlay: {
    position: "absolute",
    top: 60,
    fontSize: 16,
    color: "white",
  },

  fechar: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
  },
});
