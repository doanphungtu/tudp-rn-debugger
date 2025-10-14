"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const iconMap = {
    "content-copy": "📋",
    close: "✕",
    delete: "🗑️",
};
const IconFallback = ({ name, size = 16, color = "#666", }) => {
    return (react_1.default.createElement(react_native_1.Text, { style: [styles.icon, { fontSize: size, color }] }, iconMap[name] || "•"));
};
const styles = react_native_1.StyleSheet.create({
    icon: {
        textAlign: "center",
    },
});
exports.default = IconFallback;
