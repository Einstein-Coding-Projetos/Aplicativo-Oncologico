import React, { useMemo } from "react"
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native"

/* =========================
   MOCK DE DADOS
========================= */
const historicoMock = [
  {
    id: "1",
    date: "2026-02-01",
    text: "Paciente relatou melhora significativa da dor após início do tratamento.",
  },
  {
    id: "2",
    date: "2026-02-02",
    text: "Sem efeitos colaterais relevantes. Mantida medicação.",
  },
  {
    id: "3",
    date: "2026-02-03",
    text: "Exames laboratoriais dentro do esperado.",
  },
  {
    id: "4",
    date: "2026-02-04",
    text: "Relatada leve fadiga no período da tarde.",
  },
]

/* =========================
   COMPONENTE
========================= */
const Historico = () => {
  /* ===== RESUMO DINÂMICO ===== */
  const resumo = useMemo(() => {
    const totalEntradas = historicoMock.length

    const palavrasNoMes = historicoMock.reduce((total, item) => {
      return total + item.text.split(" ").length
    }, 0)

    // mock simples: dias seguidos = total de dias registrados
    const diasSeguidos = totalEntradas

    return {
      diasSeguidos,
      totalEntradas,
      palavrasNoMes,
    }
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>

        {/* ================= WIDGET RESUMO ================= */}
        <View style={styles.summaryContainer}>
          <Text style={styles.title}>Resumo do Histórico</Text>

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.icon}>🔥</Text>
              <Text style={styles.value}>{resumo.diasSeguidos}</Text>
              <Text style={styles.label}>dias seguidos</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.item}>
              <Text style={styles.icon}>📝</Text>
              <Text style={styles.value}>{resumo.totalEntradas}</Text>
              <Text style={styles.label}>entradas</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.item}>
              <Text style={styles.icon}>✍️</Text>
              <Text style={styles.value}>{resumo.palavrasNoMes}</Text>
              <Text style={styles.label}>palavras no mês</Text>
            </View>
          </View>
        </View>

        {/* ================= LISTA DE HISTÓRICO ================= */}
        <Text style={styles.sectionTitle}>Registros</Text>

        <FlatList
          data={historicoMock}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardDate}>{item.date}</Text>
              <Text style={styles.cardText} numberOfLines={3}>
                {item.text}
              </Text>
            </View>
          )}
        />

      </ScrollView>
    </SafeAreaView>
  )
}

export default Historico

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  screen: {
    padding: 16,
  },

  summaryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  item: {
    flex: 1,
    alignItems: "center",
  },

  divider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },

  icon: {
    fontSize: 22,
  },

  value: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 6,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  cardDate: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },

  cardText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
})
