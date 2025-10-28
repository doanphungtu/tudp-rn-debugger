# 🚀 @tudp/rn-debugger# 🚀 @tudp/rn-debugger

React Native Network Debugger với Clean Architecture - Zero native dependencies (JS only)React Native Network Debugger với Clean Architecture - Zero native dependencies (JS only)

[![npm version](https://badge.fury.io/js/@tudp%2Frn-debugger.svg)](https://badge.fury.io/js/@tudp%2Frn-debugger)[![npm version](https://badge.fury.io/js/@tudp%2Frn-debugger.svg)](https://badge.fury.io/js/@tudp%2Frn-debugger)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features## ✨ Features

- 🔍 **Real-time network monitoring** - Theo dõi tất cả network requests- � **Real-time network monitoring** - Theo dõi tất cả network requests

- 📋 **Detailed request/response** - Xem chi tiết headers, body, status- � **Detailed request/response** - Xem chi tiết headers, body, status

- 📝 **Copy as cURL** - Generate và copy cURL commands- � **Copy as cURL** - Generate và copy cURL commands

- 🎯 **Individual section copying** - Copy riêng headers, body parts- 🎯 **Individual section copying** - Copy riêng headers, body parts

- 🎨 **Clean UI** - Giao diện trực quan, dễ sử dụng- 🎨 **Clean UI** - Giao diện trực quan, dễ sử dụng

- 🏗️ **Clean Architecture** - Code structure rõ ràng, dễ maintain- 🏗️ **Clean Architecture** - Code structure rõ ràng, dễ maintain

- 📱 **Zero native deps** - Chỉ JavaScript, không cần link native- 📱 **Zero native deps** - Chỉ JavaScript, không cần link native

- 🔔 **Toast notifications** - Thông báo user-friendly- 🔔 **Toast notifications** - Thông báo user-friendly

## 📦 Installation## 📦 Installation

`bash`bash

npm install @tudp/rn-debuggernpm install @tudp/rn-debugger

# or# or

yarn add @tudp/rn-debuggeryarn add @tudp/rn-debugger

````



### Peer Dependencies### Peer Dependencies



```bash```bash

npm install @react-native-clipboard/clipboard react-native-vector-iconsnpm install @react-native-clipboard/clipboard react-native-vector-icons

# or  # or

yarn add @react-native-clipboard/clipboard react-native-vector-iconsyarn add @react-native-clipboard/clipboard react-native-vector-icons

````

## 🎯 Quick Start## 🎯 Quick Start

`typescript`typescript

import React, { useEffect } from 'react';import React, { useEffect } from 'react';

import NetworkDebugger, { startNetworkLogging } from '@tudp/rn-debugger';import NetworkDebugger, { startNetworkLogging } from '@tudp/rn-debugger';

function App() {function App() {

useEffect(() => { useEffect(() => {

    // Bắt đầu monitor network requests    // Bắt đầu monitor network requests

    startNetworkLogging();    startNetworkLogging();

}, []); }, []);

return ( return (

    <NetworkDebugger     <NetworkDebugger

      visible={__DEV__} // Chỉ hiện ở development      visible={__DEV__} // Chỉ hiện ở development

      onClose={() => {/* handle close */}}      onClose={() => {/* handle close */}}

    />    />

); );

}}

`````



## 🔧 API Reference## 🔧 API Reference



### Components### Components



#### `NetworkDebugger`#### `NetworkDebugger`



```typescriptMain component để hiển thị network debugger UI.

<NetworkDebugger

  visible={boolean}     // Show/hide debugger```typescript

  onClose={() => void}  // Callback khi đóngimport NetworkDebugger from '@tudp/rn-debugger';

/>

```<NetworkDebugger

  visible={boolean}     // Show/hide debugger

### Functions  onClose={() => void}  // Callback khi đóng

/>

```typescript```

import {

  startNetworkLogging, ### Functions

  stopNetworkLogging,

  getRequests,#### Network Monitoring

  clearRequests

} from '@tudp/rn-debugger';```typescript

import {

// Bắt đầu monitor  startNetworkLogging,

startNetworkLogging();  stopNetworkLogging,

  getRequests,

// Dừng monitor  clearRequests

stopNetworkLogging();} from '@tudp/rn-debugger';



// Lấy danh sách requests// Bắt đầu monitor

const requests = getRequests();startNetworkLogging({

  maxRequests: 100,  // Max số requests lưu (default: 100)

// Xóa tất cả requests  enableCurl: true   // Enable cURL generation (default: true)

clearRequests();});

```

// Dừng monitor

## 🎨 Features DetailstopNetworkLogging();



### 📋 Copy Functionality// Lấy danh sách requests

const requests = getRequests();

- **Copy as cURL**: Generate complete cURL command

- **Copy Headers**: Copy request/response headers riêng// Xóa tất cả requests

- **Copy Body**: Copy request/response body riêng  clearRequests();

- **Toast notifications**: Thông báo khi copy thành công/thất bại```



### 🔍 Request Details#### Utilities



- **General Info**: Method, URL, Status, Duration, Timestamp```typescript

- **Request Headers**: Tất cả headers được gửiimport {

- **Request Body**: JSON, FormData, text...  generateCurlCommand,

- **Response Headers**: Headers từ server  copyToClipboard,

- **Response Body**: JSON response, HTML, text...  formatDuration,

  formatTimestamp

## 🛠️ Development} from '@tudp/rn-debugger';



### Build// Generate cURL từ request

const curl = generateCurlCommand(networkRequest);

```bash

yarn build// Copy to clipboard

```const success = await copyToClipboard('text to copy');



### Test// Format thời gian

const duration = formatDuration(1500); // "1.5s"

```bashconst timestamp = formatTimestamp(Date.now()); // "14:30:25"

yarn test```

```

## 🎨 Features Detail

### Release

### 📋 Copy Functionality

```bash

./scripts/release.sh- **Copy as cURL**: Generate complete cURL command

```- **Copy Headers**: Copy request/response headers riêng

- **Copy Body**: Copy request/response body riêng

## 📝 Changelog- **Toast notifications**: Thông báo khi copy thành công/thất bại



See [CHANGELOG.md](CHANGELOG.md) for detailed changes.### 🔍 Request Details



## 🤝 Contributing- **General Info**: Method, URL, Status, Duration, Timestamp

- **Request Headers**: Tất cả headers được gửi

1. Fork the repo- **Request Body**: JSON, FormData, text...

2. Create feature branch (`git checkout -b feature/amazing-feature`)- **Response Headers**: Headers từ server

3. Commit changes (`git commit -m 'Add amazing feature'`)- **Response Body**: JSON response, HTML, text...

4. Push to branch (`git push origin feature/amazing-feature`)

5. Open Pull Request### 🎯 Clean Architecture



## 📄 License```

src/

MIT © [tudp](https://github.com/doanphungtu)├── domain/          # Business logic

│   ├── models/      # Data models

## 🔗 Links│   └── repositories/ # Repository interfaces

├── infrastructure/ # External services

- **NPM Package**: https://www.npmjs.com/package/@tudp/rn-debugger├── presentation/   # UI components

- **GitHub Repository**: https://github.com/doanphungtu/tudp-rn-debugger└── utils/          # Helper functions

- **Issues**: https://github.com/doanphungtu/tudp-rn-debugger/issues```



---## 🔧 Advanced Usage



Made with ❤️ by [tudp](https://github.com/doanphungtu)### Custom Integration

```typescript
import { addCallback, removeCallback } from '@tudp/rn-debugger';

// Listen to network requests
const callback = (requests) => {
  console.log('New request:', requests[requests.length - 1]);
};

addCallback(callback);

// Cleanup
removeCallback(callback);
```

### Development Only

```typescript
// App.tsx
import NetworkDebugger from '@tudp/rn-debugger';

function App() {
  return (
    <>
      {/* Your app content */}

      {/* Only show in development */}
      {__DEV__ && <NetworkDebugger visible={true} />}
    </>
  );
}
```

### Modal Integration

```typescript
import React, { useState } from 'react';
import { Button } from 'react-native';
import NetworkDebugger from '@tudp/rn-debugger';

function DebugPanel() {
  const [showDebugger, setShowDebugger] = useState(false);

  return (
    <>
      <Button
        title="Open Network Debugger"
        onPress={() => setShowDebugger(true)}
      />

      <NetworkDebugger
        visible={showDebugger}
        onClose={() => setShowDebugger(false)}
      />
    </>
  );
}
```

## 🛠️ Development

### Build

```bash
yarn build
```

### Test

```bash
yarn test
```

### Release

```bash
./scripts/release.sh
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed changes.

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT © [tudp](https://github.com/doanphungtu)

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/@tudp/rn-debugger
- **GitHub Repository**: https://github.com/doanphungtu/tudp-rn-debugger
- **Issues**: https://github.com/doanphungtu/tudp-rn-debugger/issues

---

Made with ❤️ by [tudp](https://github.com/doanphungtu)
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
`````
