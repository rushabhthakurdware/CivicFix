import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMyComplaints } from "../api/complaints";
import {
  STATUS_COLORS,
  SEVERITY_COLORS,
  formatStatus,
} from "../utils/statusBadge";

export default function MyComplaintsScreen({ navigation }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadComplaints = async () => {
    try {
      const res = await getMyComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      Alert.alert("Error", "Could not load your reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadComplaints();
  };

  const renderItem = ({ item }) => {
    const severityColor = SEVERITY_COLORS[item.severity] || "#71717a";
    const statusColor = STATUS_COLORS[item.status] || "#71717a";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("ComplaintDetail", { complaintId: item.id })
        }
      >
        <View style={styles.cardTopRow}>
          <Text style={styles.complaintId}>
            #{item.complaint_id || String(item.id).slice(0, 8)}
          </Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: `${severityColor}22`,
                  borderColor: `${severityColor}55`,
                },
              ]}
            >
              <View
                style={[styles.badgeDot, { backgroundColor: severityColor }]}
              />
              <Text style={[styles.badgeText, { color: severityColor }]}>
                {item.severity}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: `${statusColor}22`,
                  borderColor: `${statusColor}55`,
                },
              ]}
            >
              <View
                style={[styles.badgeDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {formatStatus(item.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.chevron}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topBar}>
        {navigation?.canGoBack && navigation.canGoBack() ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>📍</Text>
          </View>
          <Text style={styles.brandTitle}>CIVICFIX</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Screen Title Block */}
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>CITIZEN DASHBOARD</Text>
        <Text style={styles.headline}>My Reports</Text>
        <Text style={styles.subheadline}>
          Track status progress, investigation logs, and resolution updates.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#ffffff"
              colors={["#ffffff"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <View style={styles.emptyIconBox}>
                <Text style={styles.emptyIcon}>📋</Text>
              </View>
              <Text style={styles.emptyTitle}>No reports submitted</Text>
              <Text style={styles.emptyText}>
                You haven't reported any community issues yet. Tap below to create your first report.
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate("CreateComplaint")}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>Create Report</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            complaints.length > 0 ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  © 2026 CivicFix • Built for better communities
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#2c2c2e",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#ffffff",
    fontSize: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBadge: {
    width: 28,
    height: 28,
    backgroundColor: "#e5e5e5",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoIcon: {
    fontSize: 14,
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 38,
  },
  headerBlock: {
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  eyebrow: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headline: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subheadline: {
    color: "#8e8e93",
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 30,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#2c2c2e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptyText: {
    color: "#71717a",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#e5e5e5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  createButtonText: {
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#121214",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#26262a",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  complaintId: {
    fontSize: 12,
    color: "#71717a",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    color: "#71717a",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  chevron: {
    color: "#71717a",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    paddingBottom: 8,
  },
  footerText: {
    color: "#52525b",
    fontSize: 11,
  },
});