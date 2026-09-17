import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header / Brand Badge & Action Controls */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>📍</Text>
            </View>
            <Text style={styles.brandTitle}>CIVICFIX</Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("Notifications")}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonIconText}>🔔</Text>
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={logout}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonIconText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.eyebrow}>LOGGED IN</Text>
            <Text style={styles.welcome}>
              {user?.full_name || "Community Member"}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role || "Citizen"}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        {/* Create Complaint Action */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("CreateComplaint")}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconContainer, styles.complaintIconBg]}>
            <Text style={styles.actionIcon}>⚠️</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Create Complaint</Text>
            <Text style={styles.actionSubtitle}>
              Report public infrastructure issues directly
            </Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        {/* Notifications Action Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("Notifications")}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconContainer, styles.notificationIconBg]}>
            <Text style={styles.actionIcon}>🔔</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Notifications</Text>
            <Text style={styles.actionSubtitle}>
              Check updates and progress on your filed reports
            </Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>


        <TouchableOpacity
  style={styles.actionCard}
  onPress={() => navigation.navigate("MyComplaints")}
  activeOpacity={0.8}
>
  <View style={[styles.actionIconContainer, styles.reportsIconBg]}>
    <Text style={styles.actionIcon}>📋</Text>
  </View>
  <View style={styles.actionContent}>
    <Text style={styles.actionTitle}>Track Your Reports</Text>
    <Text style={styles.actionSubtitle}>
      View status history, progress, and updates on your complaints
    </Text>
  </View>
  <Text style={styles.chevron}>→</Text>
</TouchableOpacity>

        {/* AR Test Action Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("ArTest")}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconContainer, styles.arIconBg]}>
            <Text style={styles.actionIcon}>📱</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>AR Test</Text>
            <Text style={styles.actionSubtitle}>
              Scan environment and visualize AR mapping
            </Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        {/* Bottom Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 CivicFix • Built for better communities
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
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
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#2c2c2e",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  buttonIconText: {
    fontSize: 16,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121214",
    borderWidth: 1,
    borderColor: "#26262a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  userAvatarText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  eyebrow: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  welcome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1c1c1e",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2c2c2e",
  },
  roleText: {
    fontSize: 12,
    color: "#a1a1aa",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#a1a1aa",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121214",
    borderWidth: 1,
    borderColor: "#26262a",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  complaintIconBg: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  notificationIconBg: {
    backgroundColor: "rgba(234, 179, 8, 0.12)",
  },
  arIconBg: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  actionIcon: {
    fontSize: 18,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  actionSubtitle: {
    color: "#71717a",
    fontSize: 12,
  },
  chevron: {
    color: "#71717a",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
  },
  logoutButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#52525b",
    fontSize: 11,
  },
  reportsIconBg: {
  backgroundColor: "rgba(168, 85, 247, 0.12)", // subtle purple accent
},
});