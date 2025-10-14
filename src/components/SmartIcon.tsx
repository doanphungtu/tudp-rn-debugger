import React from "react";

// Smart Icon component that uses react-native-vector-icons when available, falls back to emoji
let Icon: React.ComponentType<any>;
let useVectorIcons = true;

try {
  Icon = require("react-native-vector-icons/MaterialIcons").default;
} catch (error) {
  useVectorIcons = false;
  Icon = require("./IconFallback").default;
}

export { Icon, useVectorIcons };
