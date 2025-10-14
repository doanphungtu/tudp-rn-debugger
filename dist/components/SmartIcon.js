"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVectorIcons = exports.Icon = void 0;
// Smart Icon component that uses react-native-vector-icons when available, falls back to emoji
let Icon;
let useVectorIcons = true;
exports.useVectorIcons = useVectorIcons;
try {
    exports.Icon = Icon = require("react-native-vector-icons/MaterialIcons").default;
}
catch (error) {
    exports.useVectorIcons = useVectorIcons = false;
    exports.Icon = Icon = require("./IconFallback").default;
}
