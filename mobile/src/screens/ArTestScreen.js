import React from "react";
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroBox,
  ViroAmbientLight,
  ViroMaterials,
} from "@reactvision/react-viro";

ViroMaterials.createMaterials({
  boxMaterial: {
    diffuseColor: "#2563eb",
  },
});

const HelloARScene = () => {
  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" />
      <ViroBox
        position={[0, -0.5, -1]}
        scale={[0.3, 0.3, 0.3]}
        materials={["boxMaterial"]}
      />
    </ViroARScene>
  );
};

export default function ArTestScreen() {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{ scene: HelloARScene }}
      style={{ flex: 1 }}
    />
  );
}