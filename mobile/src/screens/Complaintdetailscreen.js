import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { getComplaintById, getComplaintStatusHistory } from "../api/complaints";
import {
  STATUS_COLORS,
  SEVERITY_COLORS,
  formatStatus,
} from "../utils/statusBadge";

export default function ComplaintDetailScreen({ route, navigation }) {
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [complaintRes, historyRes] = await Promise.all([
          getComplaintById(complaintId),
          getComplaintStatusHistory(complaintId),
        ]);
        setComplaint(complaintRes.data);
        setHistory(historyRes.data || []);
      } catch (err) {
        Alert.alert("Error", "Could not load report details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [complaintId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </SafeAreaView>
    );
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.emptyIconBox}>
            <Text style={styles.emptyIcon}>⚠️</Text>
          </View>
          <Text style={styles.emptyTitle}>Report Not Found</Text>
          <Text style={styles.emptyText}>
            This complaint may have been archived or removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const severityColor = SEVERITY_COLORS[complaint.severity] || "#71717a";
  const statusColor = STATUS_COLORS[complaint.status] || "#71717a";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>📍</Text>
          </View>
          <Text style={styles.brandTitle}>CIVICFIX</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Evidence Image */}
        {complaint.image_url && (
          <View style={styles.imageCard}>
            <Image
              source={{ uri: complaint.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Header Information */}
        <View style={styles.metaRow}>
          <Text style={styles.complaintId}>
            #{complaint.complaint_id || String(complaint.id).slice(0, 8)}
          </Text>
          <Text style={styles.headerDate}>
            {new Date(complaint.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>

        <Text style={styles.title}>{complaint.title}</Text>

        {/* Status & Severity Badges */}
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
              {complaint.severity}
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
              {formatStatus(complaint.status)}
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{complaint.description}</Text>
        </View>

        {/* Location Section */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>Location Details</Text>
          <View style={styles.locationRow}>
            <View style={styles.locationIconBox}>
              <Text style={styles.locationPinIcon}>📍</Text>
            </View>
            <View style={styles.locationTexts}>
              <Text style={styles.addressText}>
                {complaint.address || "Address unavailable"}
              </Text>
              <Text style={styles.coordsText}>
                {Number(complaint.latitude).toFixed(5)},{" "}
                {Number(complaint.longitude).toFixed(5)}
              </Text>
            </View>
          </View>
        </View>

        {/* AR Measurement Section */}
        {complaint.measured_via_ar && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionLabel}>AR Measurement</Text>
            <View style={styles.arBadgeContainer}>
              <Text style={styles.arIcon}>📐</Text>
              <Text style={styles.arDetails}>
                {complaint.estimated_length_m}m × {complaint.estimated_width_m}m{" "}
                <Text style={styles.arArea}>
                  (~{complaint.estimated_area_sqm} m²)
                </Text>
              </Text>
            </View>
          </View>
        )}

        {/* Status Timeline Section */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionLabel}>Status Timeline</Text>
          <View style={styles.timeline}>
            {history.length === 0 ? (
              <Text style={styles.emptyTimelineText}>No status changes yet.</Text>
            ) : (
              history.map((entry, index) => {
                const stepColor =
                  STATUS_COLORS[entry.new_status] || "#71717a";
                return (
                  <View key={entry.id || index} style={styles.timelineItem}>
                    <View style={styles.timelineDotColumn}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: stepColor,
                            borderColor: `${stepColor}55`,
                          },
                        ]}
                      />
                      {index < history.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStatus}>
                        {formatStatus(entry.new_status)}
                      </Text>
                      <Text style={styles.timelineDate}>
                        {new Date(entry.created_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </Text>
                      {entry.comment && (
                        <View style={styles.commentBox}>
                          <Text style={styles.timelineComment}>
                            {entry.comment}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
  },
  imageCard: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#26262a",
    marginBottom: 18,
  },
  image: {
    width: "100%",
    height: 220,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  complaintId: {
    fontSize: 12,
    color: "#71717a",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerDate: {
    fontSize: 12,
    color: "#71717a",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 14,
    lineHeight: 28,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
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
  infoCard: {
    backgroundColor: "#121214",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#26262a",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#a1a1aa",
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  description: {
    fontSize: 14,
    color: "#d4d4d8",
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#1c1c1e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationPinIcon: {
    fontSize: 16,
  },
  locationTexts: {
    flex: 1,
  },
  addressText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  coordsText: {
    color: "#71717a",
    fontSize: 11,
  },
  arBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  arIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  arDetails: {
    color: "#e5e5e5",
    fontSize: 13,
    fontWeight: "500",
  },
  arArea: {
    color: "#a1a1aa",
    fontWeight: "400",
  },
  timelineCard: {
    backgroundColor: "#121214",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#26262a",
    marginBottom: 14,
  },
  timeline: {
    marginTop: 6,
  },
  emptyTimelineText: {
    color: "#71717a",
    fontSize: 13,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineDotColumn: {
    alignItems: "center",
    width: 22,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    borderWidth: 2,
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: "#27272a",
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
    paddingLeft: 10,
  },
  timelineStatus: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  timelineDate: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 2,
  },
  commentBox: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  timelineComment: {
    fontSize: 12,
    color: "#a1a1aa",
    fontStyle: "italic",
    lineHeight: 16,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#52525b",
    fontSize: 11,
  },
});