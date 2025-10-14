import React from "react";
import { Text, StyleSheet } from "react-native";

// Fallback component when react-native-vector-icons is not available
interface IconFallbackProps {
  name: string;
  size?: number;
  color?: string;
}

const iconMap: Record<string, string> = {
  "content-copy": "📋",
  close: "✕",
  delete: "🗑️",
};

const IconFallback: React.FC<IconFallbackProps> = ({
  name,
  size = 16,
  color = "#666",
}) => {
  return (
    <Text style={[styles.icon, { fontSize: size, color }]}>
      {iconMap[name] || "•"}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: "center",
  },
});

export default IconFallback;
