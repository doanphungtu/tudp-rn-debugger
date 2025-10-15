import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Icon } from "../components/SmartIcon";
import {
  getRequests,
  clearRequests,
  addCallback,
  removeCallback,
} from "../infrastructure/NetworkInterceptor";
import { NetworkRequest } from "../domain/models/NetworkRequest";
import {
  generateCurlCommand,
  copyToClipboard,
  formatDuration,
  formatTimestamp,
  getStatusColor,
} from "../utils/curlGenerator";
import {
  showSuccessToast,
  showErrorToast,
  ToastContainer,
} from "../utils/Toast";

// Safe string conversion utility
const safeStringify = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return "[Object - Cannot stringify]";
    }
  }
  return String(value);
};

interface NetworkDebuggerProps {
  visible?: boolean;
  onClose?: () => void;
}

const NetworkDebugger: React.FC<NetworkDebuggerProps> = ({
  visible = true,
  onClose,
}) => {
  const [data, setData] = useState<NetworkRequest[]>(getRequests());
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null
  );

  // Use callback system for real-time updates instead of polling
  const onRequestsUpdate = useCallback((requests: NetworkRequest[]) => {
    setData(requests);
  }, []);

  useEffect(() => {
    // Register callback for real-time updates
    addCallback(onRequestsUpdate);

    // Initial load
    setData(getRequests());

    return () => {
      // Cleanup callback on unmount
      removeCallback(onRequestsUpdate);
    };
  }, [onRequestsUpdate]);

  const handleCopyCurl = async (request: NetworkRequest) => {
    const curlCommand = generateCurlCommand(request);
    const success = await copyToClipboard(curlCommand);

    if (success) {
      showSuccessToast("Curl command copied to clipboard!");
    } else {
      // Fallback: show curl command in alert with copy option
      showErrorToast("Clipboard not available - showing in popup");

      // Show curl command in scrollable alert
      setTimeout(() => {
        Alert.alert(
          "cURL Command",
          curlCommand,
          [{ text: "Close", style: "cancel" }],
          {
            cancelable: true,
          }
        );
      }, 100);
    }
  };
  const handleClear = () => {
    clearRequests();
    setData([]);
  };

  const showRequestDetails = (request: NetworkRequest) => {
    setSelectedRequest(request);
  };

  const hideRequestDetails = () => {
    setSelectedRequest(null);
  };

  const renderRequestItem = ({ item }: { item: NetworkRequest }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => showRequestDetails(item)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.methodUrlContainer}>
          <Text style={[styles.method, { color: getStatusColor(item.status) }]}>
            {safeStringify(item.method).toUpperCase()}
          </Text>
          <Text style={styles.url} numberOfLines={1}>
            {safeStringify(item.url)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => handleCopyCurl(item)}
        >
          <Icon name="content-copy" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.requestMeta}>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status ? safeStringify(item.status) : "PENDING"}
        </Text>
        <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>

      {item.error && (
        <Text style={styles.error} numberOfLines={1}>
          Error: {safeStringify(item.error)}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderRequestDetails = () => {
    if (!selectedRequest) return null;

    return (
      <SafeAreaView style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={hideRequestDetails}
          >
            <Icon name="arrow-back" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>Request Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.detailsContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            <Text style={styles.detailText}>
              URL: {safeStringify(selectedRequest.url)}
            </Text>
            <Text style={styles.detailText}>
              Method:{" "}
              <Text
                style={[
                  styles.detailText,
                  {
                    color: getStatusColor(selectedRequest.status),
                    fontWeight: "600",
                  },
                ]}
              >
                {safeStringify(selectedRequest.method).toUpperCase()}
              </Text>
            </Text>
            <Text style={styles.detailText}>
              Status:{" "}
              <Text
                style={[
                  styles.detailText,
                  {
                    color: getStatusColor(selectedRequest.status),
                    fontWeight: "600",
                  },
                ]}
              >
                {selectedRequest.status
                  ? safeStringify(selectedRequest.status)
                  : "PENDING"}
              </Text>
            </Text>
            <Text style={styles.detailText}>
              Duration: {formatDuration(selectedRequest.duration)}
            </Text>
            <Text style={styles.detailText}>
              Time: {safeStringify(selectedRequest.timestamp)}
            </Text>
          </View>

          {selectedRequest.requestHeaders &&
            Object.keys(selectedRequest.requestHeaders).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Request Headers</Text>
                {Object.entries(selectedRequest.requestHeaders).map(
                  ([key, value]) => (
                    <Text key={key} style={styles.headerText}>
                      {safeStringify(key)}: {safeStringify(value)}
                    </Text>
                  )
                )}
              </View>
            )}

          {selectedRequest.requestBody && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Request Body</Text>
              <Text style={styles.bodyText}>
                {safeStringify(selectedRequest.requestBody)}
              </Text>
            </View>
          )}

          {selectedRequest.responseHeaders &&
            Object.keys(selectedRequest.responseHeaders).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Response Headers</Text>
                {Object.entries(selectedRequest.responseHeaders).map(
                  ([key, value]) => (
                    <Text key={key} style={styles.headerText}>
                      {safeStringify(key)}: {safeStringify(value)}
                    </Text>
                  )
                )}
              </View>
            )}

          {selectedRequest.responseBody && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Response Body</Text>
              <Text style={styles.bodyText}>
                {safeStringify(selectedRequest.responseBody)}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.detailsFooter}>
          <TouchableOpacity
            style={styles.copyCurlButton}
            onPress={() => handleCopyCurl(selectedRequest)}
          >
            <View style={styles.buttonContent}>
              <Icon name="content-copy" size={18} color="#fff" />
              <Text style={styles.copyCurlButtonText}>Copy as cURL</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {selectedRequest ? (
          renderRequestDetails()
        ) : (
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Network Debugger</Text>
                <Text style={styles.subtitle}>{data.length} requests</Text>
              </View>
              {onClose && (
                <TouchableOpacity
                  style={styles.headerCloseButton}
                  onPress={onClose}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={data.slice().reverse()} // Show newest first
              keyExtractor={(item) => item.id}
              renderItem={renderRequestItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View
                  style={{
                    minHeight: 300,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#999", fontSize: 16 }}>
                    No network requests yet
                  </Text>
                  <Text style={{ color: "#999", fontSize: 14, marginTop: 8 }}>
                    Start making API calls to see them here
                  </Text>
                </View>
              }
            />

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <View style={styles.buttonContent}>
                  <Icon name="delete" size={18} color="#fff" />
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Custom Toast Container */}
        <ToastContainer />
      </SafeAreaView>
    </Modal>
  );
};

export default NetworkDebugger;
export type { NetworkDebuggerProps };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerLeft: {
    flex: 1,
  },
  headerCloseButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    marginLeft: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    // paddingBottom: 80,
  },
  requestItem: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  methodUrlContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  method: {
    fontWeight: "700",
    fontSize: 12,
    minWidth: 50,
    marginRight: 6,
  },
  url: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  copyButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  copyButtonText: {
    fontSize: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    fontWeight: "600",
    fontSize: 12,
  },
  duration: {
    fontSize: 12,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  error: {
    fontSize: 12,
    color: "#F44336",
    fontStyle: "italic",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  clearButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
  },
  modalContent: {
    flex: 1,
    padding: 10,
  },
  // Details view styles
  detailsContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  placeholder: {
    width: 36,
  },
  detailsContent: {
    flex: 1,
    padding: 10,
  },
  detailsFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 20,
  },
  headerText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    fontFamily: "monospace",
  },
  bodyText: {
    fontSize: 12,
    color: "#333",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 4,
    fontFamily: "monospace",
  },
  copyCurlButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  copyCurlButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
