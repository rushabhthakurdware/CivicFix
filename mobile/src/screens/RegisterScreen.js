import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password, phone, role);
      Alert.alert("Success", "Account created. Please log in.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header / Brand Badge */}
          <View style={styles.topBar}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>📍</Text>
            </View>
            <Text style={styles.brandTitle}>CIVICFIX</Text>
          </View>

          {/* Form Content */}
          <View style={styles.mainContent}>
            {/* Top Switcher */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.switchLink}>Log in</Text>
              </TouchableOpacity>
            </View>

            {/* Icon Box */}
            <View style={styles.iconBox}>
              <Text style={styles.lockIcon}>✨</Text>
            </View>

            {/* Typography Header */}
            <Text style={styles.eyebrow}>GET STARTED</Text>
            <Text style={styles.headline}>Create an account.</Text>
            <Text style={styles.subheadline}>
              Join your community to report and track local improvements.
            </Text>

            {/* Full Name Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.fieldLeadingIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#555"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.fieldLeadingIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#555"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Phone Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone number</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.fieldLeadingIcon}>📞</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9876543210"
                  placeholderTextColor="#555"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Role Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Account Role</Text>
              <View style={[styles.inputContainer, styles.readOnlyInput]}>
                <Text style={styles.fieldLeadingIcon}>🛡️</Text>
                <TextInput
                  style={[styles.input, styles.roleInputText]}
                  value={role.charAt(0).toUpperCase() + role.slice(1)}
                  editable={false}
                />
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>Default</Text>
                </View>
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.fieldLeadingIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.toggleVisibility}
                >
                  <Text style={styles.trailingIcon}>
                    {isPasswordVisible ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#0a0a0a" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.primaryButtonText}>Register</Text>
                  <Text style={styles.arrowIcon}> →</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Security Indicator */}
            <View style={styles.securityBadge}>
              <Text style={styles.securityIcon}>🛡️</Text>
              <Text style={styles.securityText}>
                Your information is private and secure
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 CivicFix • Built for better communities
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 32,
  },
  logoBadge: {
    width: 32,
    height: 32,
    backgroundColor: "#e5e5e5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 16,
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  mainContent: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  switchText: {
    color: "#a1a1aa",
    fontSize: 14,
  },
  switchLink: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#2c2c2e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 18,
  },
  eyebrow: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  headline: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subheadline: {
    color: "#8e8e93",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#e5e5e5",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121214",
    borderWidth: 1,
    borderColor: "#26262a",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  readOnlyInput: {
    backgroundColor: "#18181b",
    borderColor: "#27272a",
  },
  roleInputText: {
    color: "#a1a1aa",
  },
  roleTag: {
    backgroundColor: "#27272a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleTagText: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "600",
  },
  fieldLeadingIcon: {
    marginRight: 10,
    fontSize: 14,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
  },
  toggleVisibility: {
    padding: 6,
  },
  trailingIcon: {
    fontSize: 14,
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: "#e5e5e5",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "600",
  },
  arrowIcon: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "600",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  securityIcon: {
    fontSize: 12,
    marginRight: 6,
    opacity: 0.7,
  },
  securityText: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginTop: 36,
    paddingBottom: 8,
  },
  footerText: {
    color: "#52525b",
    fontSize: 12,
  },
});