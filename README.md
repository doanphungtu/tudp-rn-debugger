# tudp-rn-debugger

A React Native network debugger (JS-only) implemented with Clean Architecture.

## Quickstart (developer)

1. Install dependencies:
   yarn install

2. Run tests:
   yarn test

3. Build:
   yarn build

## Using in a demo app

1. Pack the module:
   npm pack

2. In your demo RN app:
   yarn add ../path/to/tudp-rn-debugger-1.0.0.tgz

3. In App.tsx:
   import { startNetworkLogging, NetworkDebugger } from 'tudp-rn-debugger';
   use React.useEffect(() => startNetworkLogging(), []);
   return <NetworkDebugger />;

Note: When linking locally, use Metro config to alias react/react-native to the demo app to avoid duplicate react instances.
