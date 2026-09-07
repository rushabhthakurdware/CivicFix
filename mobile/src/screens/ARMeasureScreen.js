import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroSphere,
  ViroPolyline,
  ViroMaterials,
  ViroAmbientLight,
  ViroARPlane,
  ViroQuad,
} from "@reactvision/react-viro";

ViroMaterials.createMaterials({
  pointMaterial: { diffuseColor: "#f59e0b" },
  lineMaterial: { diffuseColor: "#2563eb" },
  // Transparent tap-catching surface: alpha channel (last 2 hex digits) near-zero,
  // plus blendMode so the alpha is actually respected instead of rendering opaque.
  planeMaterial: {
    diffuseColor: "#FFFFFF05",
    blendMode: "Alpha",
  },
});

// Shoelace formula for polygon area, using x/z (ground-plane) coordinates.
function calculatePolygonArea(points) {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, , z1] = points[i];
    const [x2, , z2] = points[(i + 1) % points.length];
    area += x1 * z2 - x2 * z1;
  }
  return Math.abs(area / 2);
}

function distance(p1, p2) {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dz * dz);
}

const MeasureScene = ({ sceneNavigator }) => {
  const [points, setPoints] = useState([]);

  // Register our screenshot capability with the outer screen component.
  // takeScreenshot must be called via sceneNavigator (available inside the
  // scene), not the outer ViroARSceneNavigator ref - that's what caused the
  // earlier "undefined is not a function" error.
  React.useEffect(() => {
    sceneNavigator.viroAppProps.registerScreenshotFn(() =>
      sceneNavigator.takeScreenshot(`ar_measurement_${Date.now()}`, false)
    );
  }, []);

  const handlePlaneClick = (position) => {
    console.log("Tap registered at:", position, "Total points:", points.length + 1);
    if (points.length >= 8) {
      Alert.alert("Limit reached", "Maximum 8 points. Tap Reset to start over.");
      return;
    }
    const updated = [...points, position];
    setPoints(updated);
    sceneNavigator.viroAppProps.onPointsChange(updated);
  };

  return (
    <ViroARScene
      onTrackingUpdated={(state, reason) => {
        console.log("AR Tracking State:", state, "Reason:", reason);
      }}
    >
      <ViroAmbientLight color="#ffffff" />
      {/* Auto-attaches to the first detected horizontal surface -
          no manual "select the plane" tap required, unlike ViroARPlaneSelector. */}
      <ViroARPlane
        alignment="Horizontal"
        minHeight={0.2}
        minWidth={0.2}
        onAnchorFound={() => {
          console.log("Plane anchor found");
          sceneNavigator.viroAppProps.onPlaneFound?.();
        }}
      >
        <ViroQuad
          rotation={[-90, 0, 0]}
          width={4}
          height={4}
          materials={["planeMaterial"]}
          onClick={(position) => handlePlaneClick(position)}
          arShadowReceiver={false}
        />
      </ViroARPlane>

      {/* Rendered OUTSIDE ViroARPlane, as direct scene children, so the
          world-space tap coordinates aren't shifted by the plane's own
          anchor-relative transform. This is what fixes dots appearing
          offset from where you actually tapped. */}
      {points.map((p, i) => (
        <ViroSphere
          key={`pt-${i}`}
          position={p}
          radius={0.05}
          materials={["pointMaterial"]}
        />
      ))}
      {points.length > 1 && (
        <ViroPolyline
          position={[0, 0.001, 0]}
          points={[...points, points[0]]}
          thickness={0.005}
          materials={["lineMaterial"]}
        />
      )}
    </ViroARScene>
  );
};

export default function ARMeasureScreen({ navigation, route }) {
  const [points, setPoints] = useState([]);
  const [planeFound, setPlaneFound] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const navigatorRef = useRef(null);
  const screenshotFnRef = useRef(null);

  const handleReset = () => {
    setPoints([]);
    setPlaneFound(false);
    setSceneKey((k) => k + 1); // forces ViroARSceneNavigator to fully remount, clearing AR state
  };

  const handleDone = async () => {
    if (points.length < 3) {
      Alert.alert(
        "Not enough points",
        "Tap at least 3 points around the edge of the damage."
      );
      return;
    }

    const area = calculatePolygonArea(points);

    // Rough length/width: use the two longest edges as an approximation.
    // This is a simplification, not a precise bounding-box measurement.
    let maxEdge = 0;
    let secondEdge = 0;
    for (let i = 0; i < points.length; i++) {
      const d = distance(points[i], points[(i + 1) % points.length]);
      if (d > maxEdge) {
        secondEdge = maxEdge;
        maxEdge = d;
      } else if (d > secondEdge) {
        secondEdge = d;
      }
    }

    let screenshotUri = null;
    try {
      // Calls the function MeasureScene registered - this reaches Viro's
      // real GL frame buffer directly, avoiding the SurfaceView-is-black
      // problem that a generic screenshot tool (view-shot) can't get past.
      const screenshot = await screenshotFnRef.current?.();
      if (screenshot?.success) {
        screenshotUri = screenshot.url;
      }
    } catch (err) {
      console.log("AR screenshot failed (non-fatal):", err.message);
    }

    const result = {
      areaSqMeters: Number(area.toFixed(2)),
      approxLength: Number(maxEdge.toFixed(2)),
      approxWidth: Number(secondEdge.toFixed(2)),
      screenshotUri,
    };

    if (route.params?.onMeasured) {
      route.params.onMeasured(result);
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <ViroARSceneNavigator
        key={sceneKey}
        ref={navigatorRef}
        autofocus={true}
        initialScene={{ scene: MeasureScene }}
        viroAppProps={{
          onPointsChange: setPoints,
          onPlaneFound: () => setPlaneFound(true),
          registerScreenshotFn: (fn) => {
            screenshotFnRef.current = fn;
          },
        }}
        style={{ flex: 1 }}
      />

      <View style={styles.overlay}>
        <Text style={styles.hint}>
          {!planeFound
            ? "Move phone slowly in a small figure-8 over a textured floor/table until a surface is detected..."
            : points.length === 0
            ? "Surface detected! Tap around the damaged area to mark its edges."
            : `${points.length} point${points.length > 1 ? "s" : ""} placed. Tap at least 3, then Done.`}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 8,
  },
  hint: { color: "#fff", textAlign: "center" },
  controls: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetButton: {
    backgroundColor: "#6b7280",
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  doneButton: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});