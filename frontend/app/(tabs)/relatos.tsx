import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* =====================
   TIPOS
===================== */

type Relato = {
  id: number;
  titulo: string;
  subtitulo?: string | null;
  texto: string;
};

/* =====================
   COMPONENTE
===================== */

export default function RelatosScreen() {
  const [relato, setRelato] = useState<Relato | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    buscarRelato();
  }, []);

  const buscarRelato = async () => {
    try {
      setErro(null);

      const response = await fetch(
        "http://127.0.0.1:8000/api/relato-do-dia/"
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar relato");
      }

      const data: Relato = await response.json();
      setRelato(data);
    } catch (e) {
      console.log(e);
      setErro("Não foi possível carregar o relato");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================
     ESTADOS
  ===================== */

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (erro) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>{erro}</Text>
        <TouchableOpacity style={styles.botao} onPress={buscarRelato}>
          <Text style={styles.botaoTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!relato) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Nenhum relato disponível</Text>
      </SafeAreaView>
    );
  }

  /* =====================
     RENDER PRINCIPAL
  ===================== */

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              buscarRelato();
            }}
          />
        }
      >
        <Text style={styles.titulo}>{relato.titulo}</Text>

        {relato.subtitulo ? (
          <Text style={styles.subtitulo}>{relato.subtitulo}</Text>
        ) : null}

        <Text style={styles.texto}>{relato.texto}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================
   ESTILOS
===================== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 16,
  },
  texto: {
    fontSize: 16,
    lineHeight: 24,
  },
  botao: {
    marginTop: 32,
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
