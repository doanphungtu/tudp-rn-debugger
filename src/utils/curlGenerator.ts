import { NetworkRequest } from "../domain/models/NetworkRequest";

/**
 * Generates a curl command from a NetworkRequest
 */
export const generateCurlCommand = (request: NetworkRequest): string => {
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

/**
 * Simple clipboard copy without external dependencies
 */
export const simpleCopyToClipboard = (text: string): boolean => {
  try {
    // For React Native - try to access global clipboard if available
    if (typeof global !== "undefined") {
      // Check if we're in React Native environment
      const RN = (global as any).require?.("react-native");
      if (RN?.Clipboard?.setString) {
        RN.Clipboard.setString(text);
        return true;
      }
    }

    // For Web - try simple navigator clipboard
    if (typeof window !== "undefined" && window.navigator?.clipboard) {
      window.navigator.clipboard.writeText(text);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Copies text to clipboard (React Native compatible)
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try simple method first
  if (simpleCopyToClipboard(text)) {
    return true;
  }

  try {
    // Method 1: Try @react-native-clipboard/clipboard
    try {
      const Clipboard = require("@react-native-clipboard/clipboard");
      if (Clipboard?.setString) {
        await Clipboard.setString(text);
        return true;
      }
    } catch (clipboardError) {
      // Silently continue to next method
    }

    // Method 2: Try legacy React Native Clipboard
    try {
      const ReactNative = require("react-native");
      if (ReactNative?.Clipboard?.setString) {
        ReactNative.Clipboard.setString(text);
        return true;
      }
    } catch (legacyError) {
      // Silently continue to next method
    }

    // Method 3: Try Web Clipboard API
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (webError) {
      // Silently continue
    }
  } catch (error) {
    // Silently fail
  }

  return false;
};

/**
 * Formats duration for display
 */
export const formatDuration = (duration?: number): string => {
  if (!duration) return "-";
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
};

/**
 * Formats timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

/**
 * Gets status color based on HTTP status code
 */
export const getStatusColor = (status?: number): string => {
  if (!status) return "#999";
  if (status >= 200 && status < 300) return "#4CAF50"; // Green
  if (status >= 300 && status < 400) return "#FF9800"; // Orange
  if (status >= 400) return "#F44336"; // Red
  return "#999"; // Gray
};
