import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';

interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

class ToastManager {
  private static instance: ToastManager;
  private toastRef: React.RefObject<any> | null = null;

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  setToastRef(ref: React.RefObject<any>) {
    this.toastRef = ref;
  }

  show(config: ToastConfig) {
    if (this.toastRef?.current) {
      this.toastRef.current.show(config);
    }
  }
}

export const ToastContainer: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig | null>(null);
  const toastManager = ToastManager.getInstance();

  const toastRef = React.useRef({
    show: (newConfig: ToastConfig) => {
      setConfig(newConfig);
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, newConfig.duration);
    }
  });

  useEffect(() => {
    toastManager.setToastRef(toastRef);
  }, []);

  if (!visible || !config) return null;

  const getToastStyle = () => {
    switch (config.type) {
      case 'success':
        return { backgroundColor: '#4CAF50' };
      case 'error':
        return { backgroundColor: '#F44336' };
      default:
        return { backgroundColor: '#2196F3' };
    }
  };

  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <View style={styles.toastContainer}>
      <View style={[styles.toast, getToastStyle()]}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{config.message}</Text>
      </View>
    </View>
  );
};

export const showToast = (
  message: string,
  duration: "SHORT" | "LONG" = "SHORT"
) => {
  const toastDuration = duration === "SHORT" ? 2000 : 4000;
  ToastManager.getInstance().show({
    message,
    type: 'info',
    duration: toastDuration
  });
};

export const showSuccessToast = (message: string) => {
  ToastManager.getInstance().show({
    message,
    type: 'success',
    duration: 2000
  });
};

export const showErrorToast = (message: string) => {
  ToastManager.getInstance().show({
    message,
    type: 'error',
    duration: 3000
  });
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: width - 40,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
});