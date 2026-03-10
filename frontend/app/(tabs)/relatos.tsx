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
        {/* RELATO DO DIA */}
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

        {/* FAVORITOS */}
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
                  router.push({pathname: "/relato/[id]", 
                    params : {
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },

  container: {
    padding: 20,
  },

  widgetPrincipal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 26,
    marginBottom: 30,
    minHeight: 260,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  widgetExpandido: {
    minHeight: 380,
  },

  headerRelato: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titulo: {
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitulo: {
    marginTop: 8,
    fontSize: 15,
    color: "#777",
  },

  texto: {
    marginTop: 18,
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },

  verMais: {
    marginTop: 18,
    fontSize: 14,
    color: "#6C63FF",
    fontWeight: "600",
  },

  widgetFavoritos: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 22,
    minHeight: 220,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  tituloSecundario: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
  },

  vazio: {
    color: "#888",
  },

  itemFavorito: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  tituloFavorito: {
    fontSize: 15,
  },

});
