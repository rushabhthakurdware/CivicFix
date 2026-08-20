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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { createComplaint } from "../api/complaints";
import {
  CATEGORIES,
  SEVERITIES,
  DEFAULT_SEVERITY,
} from "../utils/severityDefaults";
import { GOOGLE_MAPS_API_KEY } from "../config/keys";

const AR_ENABLED_CATEGORIES = ["POTHOLE", "SEWAGE", "ROAD_DAMAGE"];

export default function CreateComplaintScreen({ navigation }) {
  const [measurement, setMeasurement] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [image, setImage] = useState(null); // { uri, fileName, mimeType }
  const [coords, setCoords] = useState(null); // { latitude, longitude }
  const [address, setAddress] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, []);

  // When category changes, set a sensible default severity
  // but don't overwrite it if the user already picked one manually.
  const handleCategorySelect = (cat) => {
    setCategory(cat);
    if (!severity) {
      setSeverity(DEFAULT_SEVERITY[cat]);
    }
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

      // Reverse geocode via Google
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
    if (!severity) {
      Alert.alert("Missing info", "Please select a severity.");
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
if (measurement) {
  finalDescription += ` [Estimated area: ${measurement.areaSqMeters} m², measured via AR]`;
}
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", finalDescription);
      formData.append("category", category);
      formData.append("severity", severity);
      formData.append("latitude", String(coords.latitude));
      formData.append("longitude", String(coords.longitude));
      if (address) formData.append("address", address);

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Report an Issue</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Large pothole on main road"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 90 }]}
        placeholder="Describe the issue in detail"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipSelected]}
            onPress={() => handleCategorySelect(cat)}
          >
            <Text
              style={[
                styles.chipText,
                category === cat && styles.chipTextSelected,
              ]}
            >
              {cat.replace("_", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
        {category && AR_ENABLED_CATEGORIES.includes(category) && (
  <TouchableOpacity style={styles.secondaryButton} onPress={handleMeasureWithAR}>
    <Text style={styles.secondaryButtonText}>
      {measurement ? "Re-measure with AR" : "Measure with AR (optional)"}
    </Text>
  </TouchableOpacity>
)}
{measurement && (
  <Text style={styles.hint}>
    Measured: {measurement.approxLength}m × {measurement.approxWidth}m, ~{measurement.areaSqMeters} m²
  </Text>
)}
      <Text style={styles.label}>Severity</Text>
      <View style={styles.chipRow}>
        {SEVERITIES.map((sev) => (
          <TouchableOpacity
            key={sev}
            style={[styles.chip, severity === sev && styles.chipSelected]}
            onPress={() => setSeverity(sev)}
          >
            <Text
              style={[
                styles.chipText,
                severity === sev && styles.chipTextSelected,
              ]}
            >
              {sev}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {category && (
        <Text style={styles.hint}>
          Default for {category.replace("_", " ")} is{" "}
          {DEFAULT_SEVERITY[category]} — tap to change if needed.
        </Text>
      )}

      <Text style={styles.label}>Location</Text>
      {locating ? (
        <ActivityIndicator />
      ) : coords ? (
        <View>
          <Text style={styles.locationText}>
            {address || "Address unavailable"}
          </Text>
          <Text style={styles.coordsText}>
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </Text>
        </View>
      ) : (
        <Text style={styles.locationText}>Location not captured</Text>
      )}
      <TouchableOpacity onPress={fetchLocation}>
        <Text style={styles.link}>Refresh location</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Photo</Text>
      {image && (
        <Image source={{ uri: image.uri }} style={styles.preview} />
      )}
      <View style={styles.chipRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={pickFromCamera}>
          <Text style={styles.secondaryButtonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={pickFromGallery}>
          <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
        {measurement?.screenshotUri && (
  <TouchableOpacity
    style={styles.secondaryButton}
    onPress={() =>
      setImage({
        uri: measurement.screenshotUri,
        fileName: "ar_measurement.jpg",
        mimeType: "image/jpeg",
      })
    }
  >
    <Text style={styles.secondaryButtonText}>Use AR Snapshot</Text>
  </TouchableOpacity>
)}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Complaint</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  hint: { fontSize: 12, color: "#888", marginTop: -4, marginBottom: 4 },
  locationText: { fontSize: 14, color: "#333" },
  coordsText: { fontSize: 12, color: "#888", marginTop: 2 },
  link: { color: "#2563eb", marginTop: 6, fontSize: 13 },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  secondaryButtonText: { color: "#2563eb", fontWeight: "600" },
  submitButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});