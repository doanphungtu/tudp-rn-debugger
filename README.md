# TUDP React Native Network Debugger

A powerful React Native network debugging library with advanced features for monitoring API calls, generating cURL commands, and detailed request/response inspection.

## Features

- 🚀 **Real-time Network Monitoring**: Automatically captures all fetch requests
- 💪 **Force Override**: Overrides other network monitoring tools (like Reactotron) when needed
- 📋 **Copy as cURL**: Generate and copy cURL commands for any request
- 🎯 **Detailed Inspection**: View headers, body, response, timing, and status
- 🧹 **Clear Requests**: Easy management of captured requests
- 📱 **React Native UI**: Beautiful, responsive UI for viewing network requests
- 🏗️ **Clean Architecture**: Well-structured, maintainable codebase

## Installation

```bash
npm install @tudp/rn-debugger
# or
yarn add @tudp/rn-debugger
```

### For Icon Support (Required)

This library uses react-native-vector-icons for UI icons:

```bash
npm install react-native-vector-icons
# or
yarn add react-native-vector-icons
```

Follow the [installation guide](https://github.com/oblador/react-native-vector-icons#installation) for react-native-vector-icons to set up the native dependencies.

### For Clipboard Functionality (Optional)

To enable the "Copy as cURL" feature, install the clipboard library:

```bash
# Install clipboard dependency for copy functionality
npm install @react-native-clipboard/clipboard
# or
yarn add @react-native-clipboard/clipboard

# Follow setup instructions for react-native-clipboard
npx pod-install # for iOS
```

## Quick Start

### 1. Start Network Logging

```typescript
import { startNetworkLogging } from "@tudp/rn-debugger";

// Basic usage - Uses XHRInterceptor when available, falls back to fetch patching
startNetworkLogging();

// Advanced configuration
startNetworkLogging({
  force: true, // Override other network tools (e.g., Reactotron)
  maxRequests: 1000, // Maximum number of requests to keep (default: 500)
  ignoredHosts: ["localhost"], // Hosts to ignore
  ignoredUrls: ["https://analytics.example.com"], // Specific URLs to ignore
  ignoredPatterns: [
    // Regex patterns to ignore
    /^GET https:\/\/.*\.png$/, // Ignore image requests
    /\/health$/, // Ignore health check endpoints
  ],
});
```

### 2. Add the Debugger UI

```typescript
import React from "react";
import { View } from "react-native";
import { NetworkDebugger, startNetworkLogging } from "@tudp/rn-debugger";

const App = () => {
  React.useEffect(() => {
    // Start with advanced configuration
    startNetworkLogging({
      force: true,
      maxRequests: 1000,
      ignoredHosts: ["127.0.0.1"], // Ignore localhost
    });
  }, []);

  const [showDebugger, setShowDebugger] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}

      {/* Button to show debugger */}
      {__DEV__ && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
          }}
          onPress={() => setShowDebugger(true)}
        >
          <Text style={{ color: "white" }}>Debug Network</Text>
        </TouchableOpacity>
      )}

      {/* Network debugger with close option */}
      {showDebugger && (
        <NetworkDebugger
          visible={showDebugger}
          onClose={() => setShowDebugger(false)}
        />
      )}
    </View>
  );
};
```

### 3. Component Props

```typescript
interface NetworkDebuggerProps {
  visible?: boolean; // Control visibility (default: true)
  onClose?: () => void; // Callback when user closes the debugger
}

// Basic usage - always visible
<NetworkDebugger />;

// Controlled usage - with close option
const [showDebugger, setShowDebugger] = useState(false);

<NetworkDebugger
  visible={showDebugger}
  onClose={() => setShowDebugger(false)}
/>;
```

### 4. Toast Notifications

```typescript
import { showSuccessToast, showErrorToast, showToast } from "@tudp/rn-debugger";

// Success toast
showSuccessToast("Request copied successfully!");

// Error toast
showErrorToast("Failed to copy request");

// Custom toast
showToast("Custom message", "SHORT"); // or "LONG"
```

### 5. Using API

````typescript
import {
  startNetworkLogging,
  stopNetworkLogging,
  getRequests,
  clearRequests,
  addCallback,
  removeCallback
} from '@tudp/rn-debugger';

// Start monitoring with advanced options
startNetworkLogging({
  force: true,
  maxRequests: 1000,
  ignoredPatterns: [/\/logs$/, /\/metrics$/]
});

// Real-time callback for request updates
const onRequestsUpdate = (requests) => {
  console.log(`Total requests: ${requests.length}`);
};

addCallback(onRequestsUpdate);

// Get all captured requests
const requests = getRequests();

// Clear all requests
clearRequests();

// Remove callback
removeCallback(onRequestsUpdate);

// Stop monitoring
stopNetworkLogging();
```## Troubleshooting

### Interceptor not capturing requests?

Use debug functions to check the status:

```typescript
import { getDebugInfo, testInterceptor } from "@tudp/rn-debugger";

// Check interceptor status
const debugInfo = getDebugInfo();
console.log("Debug info:", debugInfo);

// Test if interceptor is working
testInterceptor().then((success) => {
  console.log("Interceptor test:", success ? "PASSED" : "FAILED");
});
````

Debug info will show:

- `isLogging`: Whether interceptor is active
- `hasOriginalFetch`: Whether original fetch was saved
- `hasFetch`: Whether fetch exists in global scope
- `fetchIsPatched`: Whether fetch has been patched
- `requestCount`: Number of captured requests

### Common issues:

1. **No requests showing**: Make sure to call `startNetworkLogging({ force: true })`
2. **Reactotron conflict**: Use `force: true` option
3. **Missing global fetch**: Check if your React Native version supports fetch

## Architecture & Performance

### 🚀 **Dual Interception Strategy**

The library uses an intelligent dual-strategy approach:

1. **XHRInterceptor (Preferred)**: Uses React Native's built-in XHRInterceptor when available

   - More stable and efficient
   - Better compatibility with React Native ecosystem
   - Automatic fallback support for different RN versions (0.78+)

2. **Fetch Patching (Fallback)**: Direct fetch patching when XHRInterceptor unavailable
   - Universal compatibility
   - Works with any JavaScript environment

### 🎯 **Performance Optimizations**

- **Debounced Updates**: UI updates are debounced to prevent excessive re-renders
- **Singleton Pattern**: Single logger instance prevents memory leaks
- **Smart Filtering**: Multiple filtering strategies to reduce noise
- **Memory Management**: Automatic request limit enforcement
- **Real-time Callbacks**: Efficient callback system instead of polling

### ⚡ **Smart Filtering System**

```typescript
startNetworkLogging({
  ignoredHosts: ["analytics.com", "metrics.service.com"],
  ignoredUrls: ["https://api.service.com/health"],
  ignoredPatterns: [
    /^GET.*\.(png|jpg|gif)$/, // Ignore image requests
    /\/websocket$/, // Ignore WebSocket connections
    /\?utm_/, // Ignore tracking URLs
  ],
});
```

### Force Override Mode

When you have other network monitoring tools (like Reactotron) running, use the `force` option:

```typescript
startNetworkLogging({ force: true });
```

This will override any existing fetch patches and ensure that tudp-rn-debugger captures all network requests.

### Generate cURL Commands

```typescript
import { generateCurlCommand, getRequests } from "@tudp/rn-debugger";

const requests = getRequests();
const curlCommand = generateCurlCommand(requests[0]);
console.log(curlCommand);

// Output:
// curl -X POST \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer token123" \
//   -d "{"username":"test","password":"123"}" \
//   "https://api.example.com/login"
```

## Development Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Build

```bash
yarn build
```

### 3. Test

```bash
yarn test
```

### 4. Pack for Testing

```bash
npm pack
```

## Using in a Demo App

1. Pack the module:

   ```bash
   npm pack
   ```

2. In your demo RN app:

   ```bash
   yarn add ../path/to/tudp-rn-debugger-1.0.0.tgz
   ```

3. In App.tsx:

   ```typescript
   import { startNetworkLogging, NetworkDebugger } from "@tudp/rn-debugger";

   const App = () => {
     React.useEffect(() => {
       startNetworkLogging({ force: true });
     }, []);

     return <View style={{ flex: 1 }}>{__DEV__ && <NetworkDebugger />}</View>;
   };
   ```

Note: When linking locally, use Metro config to alias react/react-native to the demo app to avoid duplicate react instances.
