import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Relato = {
  id: number;
  titulo: string;
  subtitulo: string;
  texto: string;
  fonte: string;
  data: string;
};

export default function Relatos() {
  const [favoritos, setFavoritos] = useState<Relato[]>([]);
  const [relatoDoDia, setRelatoDoDia] = useState<Relato | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(false);
  const router = useRouter();

  useEffect(() => {
    carregarFavoritos();
    buscarRelatoDoDia();
  }, []);

  async function buscarRelatoDoDia() {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/relato-do-dia"
      );

      const data = await response.json();
      setRelatoDoDia(data);
    } catch (error) {
      console.log("Erro ao buscar relato:", error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarFavoritos() {
    const dados = await AsyncStorage.getItem("favoritos");
    if (dados) {
      setFavoritos(JSON.parse(dados));
    }
  }

  async function toggleFavorito(relato: Relato) {
    let novosFavoritos;
    const jaExiste = favoritos.find((item) => item.id === relato.id);

    if (jaExiste) {
      novosFavoritos = favoritos.filter((item) => item.id !== relato.id);
    } else {
      novosFavoritos = [...favoritos, relato];
    }

    setFavoritos(novosFavoritos);
    await AsyncStorage.setItem("favoritos", JSON.stringify(novosFavoritos));
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!relatoDoDia) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text>Não foi possível carregar o relato.</Text>
      </SafeAreaView>
    );
  }

  const ehFavorito = favoritos.some(
    (item) => item.id === relatoDoDia.id
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={[
            styles.widgetPrincipal,
            expandido && styles.widgetExpandido,
          ]}
          activeOpacity={0.95}
          onPress={() => setExpandido(!expandido)}
        >
          <View style={styles.headerRelato}>
            <Text style={styles.titulo}>
              {relatoDoDia.titulo}
            </Text>

            <TouchableOpacity
              onPress={() => toggleFavorito(relatoDoDia)}
            >
              <Ionicons
                name={ehFavorito ? "star" : "star-outline"}
                size={28}
                color="#F4B400"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitulo}>
            {relatoDoDia.subtitulo}
          </Text>

          <Text style={styles.texto}>
            {expandido
              ? relatoDoDia.texto
              : relatoDoDia.texto.substring(0, 180) + "..."}
          </Text>

          <Text style={styles.verMais}>
            {expandido ? "Ver menos" : "Toque para ler completo"}
          </Text>
        </TouchableOpacity>

        <View style={styles.widgetFavoritos}>
          <Text style={styles.tituloSecundario}>
            ⭐ Relatos Favoritados
          </Text>

          {favoritos.length === 0 ? (
            <Text style={styles.vazio}>
              Você ainda não favoritou nenhum relato.
            </Text>
          ) : (
            favoritos.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemFavorito}
                onPress={() =>
                  router.push({
                    pathname: "/relato/[id]",
                    params: {
                      id: item.id,
                      titulo: item.titulo,
                      subtitulo: item.subtitulo,
                      texto: item.texto,
                    },
                  })
                }
              >
                <Text style={styles.tituloFavorito}>
                  {item.titulo}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
