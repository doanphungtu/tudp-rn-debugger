import React from 'react';
import { render } from '@testing-library/react-native';
import NetworkDebugger from '../src/presentation/NetworkDebugger';
import { startNetworkLogging } from '../src/infrastructure/NetworkInterceptor';

describe('NetworkDebugger', () => {
  it('renders and updates', () => {
    startNetworkLogging();
    const { getByText } = render(<NetworkDebugger />);
    expect(getByText('Network Debugger')).toBeTruthy();
  });
});
