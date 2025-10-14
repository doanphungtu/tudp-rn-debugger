"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusColor = exports.formatTimestamp = exports.formatDuration = exports.copyToClipboard = exports.simpleCopyToClipboard = exports.generateCurlCommand = void 0;
/**
 * Generates a curl command from a NetworkRequest
 */
const generateCurlCommand = (request) => {
    const { url, method, requestHeaders, requestBody } = request;
    let curlCommand = `curl -X ${method.toUpperCase()}`;
    // Add headers
    if (requestHeaders) {
        Object.entries(requestHeaders).forEach(([key, value]) => {
            curlCommand += ` \\\n  -H "${key}: ${value}"`;
        });
    }
    // Add request body
    if (requestBody && method.toUpperCase() !== "GET") {
        // Escape quotes in body
        const escapedBody = requestBody.replace(/"/g, '\\"');
        curlCommand += ` \\\n  -d "${escapedBody}"`;
    }
    // Add URL (always last)
    curlCommand += ` \\\n  "${url}"`;
    return curlCommand;
};
exports.generateCurlCommand = generateCurlCommand;
/**
 * Simple clipboard copy without external dependencies
 */
const simpleCopyToClipboard = (text) => {
    var _a, _b, _c, _d;
    console.log("🔄 Attempting simple clipboard copy...");
    try {
        // For React Native - try to access global clipboard if available
        if (typeof global !== "undefined") {
            // Check if we're in React Native environment
            const RN = (_b = (_a = global).require) === null || _b === void 0 ? void 0 : _b.call(_a, "react-native");
            if ((_c = RN === null || RN === void 0 ? void 0 : RN.Clipboard) === null || _c === void 0 ? void 0 : _c.setString) {
                RN.Clipboard.setString(text);
                console.log("✅ Success with global React Native Clipboard");
                return true;
            }
        }
        // For Web - try simple navigator clipboard
        if (typeof window !== "undefined" && ((_d = window.navigator) === null || _d === void 0 ? void 0 : _d.clipboard)) {
            window.navigator.clipboard.writeText(text);
            console.log("✅ Success with window.navigator.clipboard");
            return true;
        }
        console.log("❌ No simple clipboard method available");
        return false;
    }
    catch (error) {
        console.log("❌ Simple clipboard failed:", error);
        return false;
    }
};
exports.simpleCopyToClipboard = simpleCopyToClipboard;
/**
 * Copies text to clipboard (React Native compatible)
 */
const copyToClipboard = async (text) => {
    var _a, _b;
    console.log("🔄 Attempting to copy to clipboard...");
    // Try simple method first
    if ((0, exports.simpleCopyToClipboard)(text)) {
        return true;
    }
    try {
        // Method 1: Try @react-native-clipboard/clipboard
        try {
            const Clipboard = require("@react-native-clipboard/clipboard");
            if (Clipboard === null || Clipboard === void 0 ? void 0 : Clipboard.setString) {
                await Clipboard.setString(text);
                console.log("✅ Successfully copied using @react-native-clipboard/clipboard");
                return true;
            }
            else {
                console.log("❌ @react-native-clipboard/clipboard setString not available");
            }
        }
        catch (clipboardError) {
            console.log("❌ @react-native-clipboard/clipboard failed:", clipboardError);
        }
        // Method 2: Try legacy React Native Clipboard
        try {
            const ReactNative = require("react-native");
            if ((_a = ReactNative === null || ReactNative === void 0 ? void 0 : ReactNative.Clipboard) === null || _a === void 0 ? void 0 : _a.setString) {
                ReactNative.Clipboard.setString(text);
                console.log("✅ Successfully copied using legacy RN Clipboard");
                return true;
            }
            else {
                console.log("❌ Legacy RN Clipboard not available");
            }
        }
        catch (legacyError) {
            console.log("❌ Legacy RN Clipboard failed:", legacyError);
        }
        // Method 3: Try Web Clipboard API
        try {
            if (typeof navigator !== "undefined" && ((_b = navigator === null || navigator === void 0 ? void 0 : navigator.clipboard) === null || _b === void 0 ? void 0 : _b.writeText)) {
                await navigator.clipboard.writeText(text);
                console.log("✅ Successfully copied using Web Clipboard API");
                return true;
            }
            else {
                console.log("❌ Web Clipboard API not available");
            }
        }
        catch (webError) {
            console.log("❌ Web Clipboard API failed:", webError);
        }
    }
    catch (error) {
        console.error("❌ All clipboard methods failed:", error);
    }
    console.log("❌ No clipboard method worked");
    return false;
};
exports.copyToClipboard = copyToClipboard;
/**
 * Formats duration for display
 */
const formatDuration = (duration) => {
    if (!duration)
        return "-";
    if (duration < 1000)
        return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
};
exports.formatDuration = formatDuration;
/**
 * Formats timestamp for display
 */
const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
};
exports.formatTimestamp = formatTimestamp;
/**
 * Gets status color based on HTTP status code
 */
const getStatusColor = (status) => {
    if (!status)
        return "#999";
    if (status >= 200 && status < 300)
        return "#4CAF50"; // Green
    if (status >= 300 && status < 400)
        return "#FF9800"; // Orange
    if (status >= 400)
        return "#F44336"; // Red
    return "#999"; // Gray
};
exports.getStatusColor = getStatusColor;
