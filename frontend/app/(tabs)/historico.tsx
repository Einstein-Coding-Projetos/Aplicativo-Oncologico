import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function Historico() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Histórico",
        }}
      />

      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Histórico
        </Text>

        <Text style={{ marginTop: 12 }}>
          Aqui ficará o histórico do usuário.
        </Text>
      </View>
    </>
  );
}
