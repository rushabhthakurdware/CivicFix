import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { createComplaint } from "../api/complaints";
import {
  CATEGORIES,
  DEFAULT_SEVERITY,
} from "../utils/severityDefaults";
import { GOOGLE_MAPS_API_KEY } from "../config/keys";

const AR_ENABLED_CATEGORIES = ["POTHOLE", "SEWAGE", "ROAD_DAMAGE"];

export default function CreateComplaintScreen({ navigation }) {
  const [measurement, setMeasurement] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [image, setImage] = useState(null);
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
  };

  const fetchLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location needed",
          "Location permission is required to submit a complaint."
        );
        setLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;
      setCoords({ latitude, longitude });

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      }
    } catch (err) {
      Alert.alert("Location Error", "Could not fetch your location.");
    } finally {
      setLocating(false);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera needed", "Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const pickFromGallery = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Gallery needed", "Gallery permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleMeasureWithAR = () => {
    navigation.navigate("ARMeasure", {
      onMeasured: (result) => {
        setMeasurement(result);
      },
    });
  };

  const handleSubmit = async () => {
    if (!title || title.trim().length < 5) {
      Alert.alert("Missing info", "Title must be at least 5 characters.");
      return;
    }
    if (!description || description.trim().length < 10) {
      Alert.alert(
        "Missing info",
        "Description must be at least 10 characters."
      );
      return;
    }
    if (!category) {
      Alert.alert("Missing info", "Please select a category.");
      return;
    }
    if (!coords) {
      Alert.alert(
        "Missing location",
        "Location not captured yet. Try again."
      );
      return;
    }
    if (!image) {
      Alert.alert("Missing image", "Please add a photo of the damage.");
      return;
    }

    let finalDescription = description.trim();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", finalDescription);
      formData.append("category", category);
      formData.append("latitude", String(coords.latitude));
      formData.append("longitude", String(coords.longitude));
      if (address) formData.append("address", address);
      if (measurement) {
        formData.append("estimated_area_sqm", String(measurement.areaSqMeters));
        formData.append("estimated_length_m", String(measurement.approxLength));
        formData.append("estimated_width_m", String(measurement.approxWidth));
        formData.append("measured_via_ar", "true");
      }

      formData.append("image", {
        uri: image.uri,
        name: image.fileName || "complaint.jpg",
        type: image.mimeType || "image/jpeg",
      });

      await createComplaint(formData);

      Alert.alert("Success", "Complaint submitted successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to submit complaint.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
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
          {/* Top Header */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
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

          {/* Form Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>CITIZEN REPORT</Text>
            <Text style={styles.headline}>Report an issue.</Text>
            <Text style={styles.subheadline}>
              Provide the details, photo, and exact location to help teams resolve it faster.
            </Text>
          </View>

          {/* Title Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLeadingIcon}>📝</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Large pothole on main road"
                placeholderTextColor="#555"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Category Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => handleCategorySelect(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {cat.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {category && (
              <Text style={styles.hint}>
                Default severity for {category.replace("_", " ")} is{" "}
                <Text style={styles.hintHighlight}>
                  {DEFAULT_SEVERITY[category]}
                </Text>
              </Text>
            )}
          </View>

          {/* AR Measurement Tooling (Conditioned by Category) */}
          {category && AR_ENABLED_CATEGORIES.includes(category) && (
            <View style={styles.arSection}>
              <TouchableOpacity
                style={styles.arButton}
                onPress={handleMeasureWithAR}
                activeOpacity={0.8}
              >
                <Text style={styles.arButtonIcon}>📐</Text>
                <Text style={styles.arButtonText}>
                  {measurement ? "Re-measure with AR" : "Measure with AR (optional)"}
                </Text>
              </TouchableOpacity>
              {measurement && (
                <View style={styles.arBadge}>
                  <Text style={styles.arBadgeText}>
                    ✨ Measured: {measurement.approxLength}m × {measurement.approxWidth}m (~{measurement.areaSqMeters} m²)
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Description Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#555"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Location Details */}
          <View style={styles.fieldGroup}>
            <View style={styles.locationHeaderRow}>
              <Text style={styles.label}>Location</Text>
              <TouchableOpacity onPress={fetchLocation} activeOpacity={0.7}>
                <Text style={styles.refreshLink}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.locationCard}>
              <View style={styles.locationIconContainer}>
                <Text style={styles.locationPinIcon}>📍</Text>
              </View>
              <View style={styles.locationInfo}>
                {locating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : coords ? (
                  <>
                    <Text style={styles.locationAddress} numberOfLines={2}>
                      {address || "Address unavailable"}
                    </Text>
                    <Text style={styles.locationCoords}>
                      {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.locationUnavailable}>
                    Location not captured yet
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Photo Attachment */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Evidence Photo</Text>
            {image && (
              <View style={styles.previewWrapper}>
                <Image source={{ uri: image.uri }} style={styles.preview} />
                <TouchableOpacity
                  style={styles.removeImageBadge}
                  onPress={() => setImage(null)}
                >
                  <Text style={styles.removeImageIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.mediaButtonRow}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={pickFromCamera}
                activeOpacity={0.7}
              >
                <Text style={styles.mediaButtonIcon}>📷</Text>
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={pickFromGallery}
                activeOpacity={0.7}
              >
                <Text style={styles.mediaButtonIcon}>🖼️</Text>
                <Text style={styles.mediaButtonText}>Gallery</Text>
              </TouchableOpacity>
              {measurement?.screenshotUri && (
                <TouchableOpacity
                  style={[styles.mediaButton, styles.mediaButtonHighlighted]}
                  onPress={() => {
                    const uri = measurement.screenshotUri.startsWith("file://")
                      ? measurement.screenshotUri
                      : `file://${measurement.screenshotUri}`;
                    setImage({
                      uri,
                      fileName: "ar_measurement.jpg",
                      mimeType: "image/jpeg",
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mediaButtonIcon}>📱</Text>
                  <Text style={styles.mediaButtonText}>AR Snapshot</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#0a0a0a" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.primaryButtonText}>Submit Complaint</Text>
                <Text style={styles.arrowIcon}> →</Text>
              </View>
            )}
          </TouchableOpacity>

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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
    marginBottom: 24,
  },
  eyebrow: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  headline: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheadline: {
    color: "#8e8e93",
    fontSize: 14,
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#e5e5e5",
    fontSize: 13,
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
  textAreaContainer: {
    height: 100,
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  textArea: {
    height: "100%",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: {
    backgroundColor: "#e5e5e5",
    borderColor: "#ffffff",
  },
  chipText: {
    fontSize: 12,
    color: "#a1a1aa",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  chipTextSelected: {
    color: "#0a0a0a",
  },
  hint: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 8,
  },
  hintHighlight: {
    color: "#ffffff",
    fontWeight: "600",
  },
  arSection: {
    marginBottom: 20,
  },
  arButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#2c2c2e",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  arButtonIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  arButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  arBadge: {
    marginTop: 8,
    backgroundColor: "#121214",
    borderWidth: 1,
    borderColor: "#26262a",
    padding: 10,
    borderRadius: 10,
  },
  arBadgeText: {
    color: "#a1a1aa",
    fontSize: 12,
    textAlign: "center",
  },
  locationHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  refreshLink: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "600",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121214",
    borderWidth: 1,
    borderColor: "#26262a",
    borderRadius: 12,
    padding: 14,
  },
  locationIconContainer: {
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
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  locationCoords: {
    color: "#71717a",
    fontSize: 11,
  },
  locationUnavailable: {
    color: "#71717a",
    fontSize: 13,
  },
  previewWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26262a",
  },
  removeImageBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  removeImageIcon: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  mediaButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mediaButton: {
    flex: 1,
    minWidth: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  mediaButtonHighlighted: {
    borderColor: "#3f3f46",
    backgroundColor: "#202024",
  },
  mediaButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  mediaButtonText: {
    color: "#e5e5e5",
    fontSize: 12,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#e5e5e5",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
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
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    color: "#52525b",
    fontSize: 11,
  },
});