// Example usage of tudp-rn-debugger in a React Native app
//
// INSTALLATION REQUIRED:
// 1. npm install react-native-vector-icons
// 2. Follow react-native-vector-icons setup guide for native dependencies
// 3. Optional: npm install @react-native-clipboard/clipboard for copy functionality

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
  startNetworkLogging,
  stopNetworkLogging,
  NetworkDebugger,
  clearRequests,
  getRequests,
  generateCurlCommand,
  getDebugInfo,
  testInterceptor,
} from "../src"; // Local import for development

const ExampleApp = () => {
  const [showDebugger, setShowDebugger] = useState(false);
  useEffect(() => {
    // Start with advanced configuration
    startNetworkLogging({
      force: true,
      maxRequests: 1000,
      ignoredHosts: ["127.0.0.1"],
      ignoredPatterns: [/\.(png|jpg|gif)$/], // Ignore image requests
    });

    return () => {
      // Clean up when component unmounts
      stopNetworkLogging();
    };
  }, []);

  // Example API calls to demonstrate the debugger
  const makeGetRequest = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts/1"
      );
      const data = await response.json();
      Alert.alert("Success", `Fetched post: ${data.title}`);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const makePostRequest = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer demo-token-123",
          },
          body: JSON.stringify({
            title: "Test Post",
            body: "This is a test post from tudp-rn-debugger",
            userId: 1,
          }),
        }
      );
      const data = await response.json();
      Alert.alert("Success", `Created post with ID: ${data.id}`);
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  };

  const makeErrorRequest = async () => {
    try {
      await fetch("https://httpstat.us/500");
    } catch (error) {
      Alert.alert("Expected Error", "This was an intentional 500 error");
    }
  };

  const showCurlExample = () => {
    const requests = getRequests();
    if (requests.length === 0) {
      Alert.alert("No Requests", "Make some API calls first!");
      return;
    }

    const lastRequest = requests[requests.length - 1];
    const curlCommand = generateCurlCommand(lastRequest);

    Alert.alert("Generated cURL Command", curlCommand, [{ text: "OK" }]);
  };

  const clearAllRequests = () => {
    clearRequests();
    Alert.alert("Cleared", "All network requests have been cleared");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TUDP RN Debugger Example</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={makeGetRequest}>
          <Text style={styles.buttonText}>GET Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={makePostRequest}>
          <Text style={styles.buttonText}>POST Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={makeErrorRequest}
        >
          <Text style={styles.buttonText}>Error Request (500)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.utilButton]}
          onPress={showCurlExample}
        >
          <Text style={styles.buttonText}>Show cURL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearAllRequests}
        >
          <Text style={styles.buttonText}>Clear Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.debugButton]}
          onPress={() => setShowDebugger(true)}
        >
          <Text style={styles.buttonText}>🐛 Open Network Debugger</Text>
        </TouchableOpacity>
      </View>

      {/* Network Debugger with close option */}
      <NetworkDebugger
        visible={showDebugger}
        onClose={() => setShowDebugger(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  errorButton: {
    backgroundColor: "#F44336",
  },
  utilButton: {
    backgroundColor: "#FF9800",
  },
  clearButton: {
    backgroundColor: "#9E9E9E",
  },
  debugButton: {
    backgroundColor: "#FF6B35",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  debuggerContainer: {
    flex: 1,
    marginTop: 20,
  },
});

export default ExampleApp;

// Additional usage examples:

// 1. Programmatically check requests
export const checkNetworkRequests = () => {
  const requests = getRequests();
  console.log(`Total requests: ${requests.length}`);

  const failedRequests = requests.filter(
    (req) => req.status && req.status >= 400
  );
  console.log(`Failed requests: ${failedRequests.length}`);

  const slowRequests = requests.filter(
    (req) => req.duration && req.duration > 2000
  );
  console.log(`Slow requests (>2s): ${slowRequests.length}`);
};

// 2. Export requests for analysis
export const exportRequestsToJson = () => {
  const requests = getRequests();
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalRequests: requests.length,
    requests: requests.map((req) => ({
      url: req.url,
      method: req.method,
      status: req.status,
      duration: req.duration,
      timestamp: req.timestamp,
      success: req.status ? req.status < 400 : false,
    })),
  };

  return JSON.stringify(exportData, null, 2);
};

// 3. Performance monitoring
export const getPerformanceStats = () => {
  const requests = getRequests();

  if (requests.length === 0) {
    return { message: "No requests to analyze" };
  }

  const durations = requests
    .filter((req) => req.duration)
    .map((req) => req.duration!);

  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  const minDuration = Math.min(...durations);

  const successRate =
    (requests.filter(
      (req) => req.status && req.status >= 200 && req.status < 300
    ).length /
      requests.length) *
    100;

  return {
    totalRequests: requests.length,
    averageDuration: Math.round(avgDuration),
    maxDuration,
    minDuration,
    successRate: Math.round(successRate * 100) / 100,
  };
};
