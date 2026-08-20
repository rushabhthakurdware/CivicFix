import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.full_name}</Text>
      <Text style={styles.role}>Role: {user?.role}</Text>

      <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.navigate("CreateComplaint")}>
        <Text style={styles.buttonText}>Create Complaint  </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ArTest")}>
  <Text>AR Test</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  welcome: { fontSize: 22, fontWeight: "600" },
  role: { fontSize: 14, color: "#666", marginTop: 6, marginBottom: 24 },
  button: { backgroundColor: "#dc2626", padding: 12, borderRadius: 8, paddingHorizontal: 24 },
  buttonText: { color: "#fff", fontWeight: "600" },
});