"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const SmartIcon_1 = require("../components/SmartIcon");
const NetworkInterceptor_1 = require("../infrastructure/NetworkInterceptor");
const curlGenerator_1 = require("../utils/curlGenerator");
const Toast_1 = require("../utils/Toast");
// Safe string conversion utility
const safeStringify = (value) => {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "object") {
        try {
            return JSON.stringify(value, null, 2);
        }
        catch (e) {
            return "[Object - Cannot stringify]";
        }
    }
    return String(value);
};
const NetworkDebugger = ({ visible = true, onClose, }) => {
    const [data, setData] = (0, react_1.useState)((0, NetworkInterceptor_1.getRequests)());
    const [selectedRequest, setSelectedRequest] = (0, react_1.useState)(null);
    // Use callback system for real-time updates instead of polling
    const onRequestsUpdate = (0, react_1.useCallback)((requests) => {
        setData(requests);
    }, []);
    (0, react_1.useEffect)(() => {
        // Register callback for real-time updates
        (0, NetworkInterceptor_1.addCallback)(onRequestsUpdate);
        // Initial load
        setData((0, NetworkInterceptor_1.getRequests)());
        return () => {
            // Cleanup callback on unmount
            (0, NetworkInterceptor_1.removeCallback)(onRequestsUpdate);
        };
    }, [onRequestsUpdate]);
    const handleCopyCurl = async (request) => {
        const curlCommand = (0, curlGenerator_1.generateCurlCommand)(request);
        const success = await (0, curlGenerator_1.copyToClipboard)(curlCommand);
        if (success) {
            (0, Toast_1.showSuccessToast)("Curl command copied to clipboard!");
        }
        else {
            // Fallback: show curl command in alert with copy option
            (0, Toast_1.showErrorToast)("Clipboard not available - showing in popup");
            // Show curl command in scrollable alert
            setTimeout(() => {
                react_native_1.Alert.alert("cURL Command", curlCommand, [{ text: "Close", style: "cancel" }], {
                    cancelable: true,
                });
            }, 100);
        }
    };
    const handleClear = () => {
        (0, NetworkInterceptor_1.clearRequests)();
        setData([]);
    };
    const showRequestDetails = (request) => {
        setSelectedRequest(request);
    };
    const hideRequestDetails = () => {
        setSelectedRequest(null);
    };
    const renderRequestItem = ({ item }) => (react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.requestItem, onPress: () => showRequestDetails(item) },
        react_1.default.createElement(react_native_1.View, { style: styles.requestHeader },
            react_1.default.createElement(react_native_1.View, { style: styles.methodUrlContainer },
                react_1.default.createElement(react_native_1.Text, { style: [styles.method, { color: (0, curlGenerator_1.getStatusColor)(item.status) }] }, safeStringify(item.method).toUpperCase()),
                react_1.default.createElement(react_native_1.Text, { style: styles.url, numberOfLines: 1 }, safeStringify(item.url))),
            react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.copyButton, onPress: () => handleCopyCurl(item) },
                react_1.default.createElement(SmartIcon_1.Icon, { name: "content-copy", size: 16, color: "#666" }))),
        react_1.default.createElement(react_native_1.View, { style: styles.requestMeta },
            react_1.default.createElement(react_native_1.Text, { style: [styles.status, { color: (0, curlGenerator_1.getStatusColor)(item.status) }] }, item.status ? safeStringify(item.status) : "PENDING"),
            react_1.default.createElement(react_native_1.Text, { style: styles.duration }, (0, curlGenerator_1.formatDuration)(item.duration)),
            react_1.default.createElement(react_native_1.Text, { style: styles.timestamp }, (0, curlGenerator_1.formatTimestamp)(item.timestamp))),
        item.error && (react_1.default.createElement(react_native_1.Text, { style: styles.error, numberOfLines: 1 },
            "Error: ",
            safeStringify(item.error)))));
    const renderRequestDetails = () => {
        if (!selectedRequest)
            return null;
        return (react_1.default.createElement(react_native_1.SafeAreaView, { style: styles.detailsContainer },
            react_1.default.createElement(react_native_1.View, { style: styles.detailsHeader },
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.backButton, onPress: hideRequestDetails },
                    react_1.default.createElement(SmartIcon_1.Icon, { name: "arrow-back", size: 20, color: "#666" })),
                react_1.default.createElement(react_native_1.Text, { style: styles.detailsTitle }, "Request Details"),
                react_1.default.createElement(react_native_1.View, { style: styles.placeholder })),
            react_1.default.createElement(react_native_1.ScrollView, { style: styles.detailsContent },
                react_1.default.createElement(react_native_1.View, { style: styles.section },
                    react_1.default.createElement(react_native_1.Text, { style: styles.sectionTitle }, "General"),
                    react_1.default.createElement(react_native_1.Text, { style: styles.detailText },
                        "URL: ",
                        safeStringify(selectedRequest.url)),
                    react_1.default.createElement(react_native_1.Text, { style: styles.detailText },
                        "Method:",
                        " ",
                        react_1.default.createElement(react_native_1.Text, { style: [
                                styles.detailText,
                                {
                                    color: (0, curlGenerator_1.getStatusColor)(selectedRequest.status),
                                    fontWeight: "600",
                                },
                            ] }, safeStringify(selectedRequest.method).toUpperCase())),
                    react_1.default.createElement(react_native_1.Text, { style: styles.detailText },
                        "Status:",
                        " ",
                        react_1.default.createElement(react_native_1.Text, { style: [
                                styles.detailText,
                                {
                                    color: (0, curlGenerator_1.getStatusColor)(selectedRequest.status),
                                    fontWeight: "600",
                                },
                            ] }, selectedRequest.status
                            ? safeStringify(selectedRequest.status)
                            : "PENDING")),
                    react_1.default.createElement(react_native_1.Text, { style: styles.detailText },
                        "Duration: ",
                        (0, curlGenerator_1.formatDuration)(selectedRequest.duration)),
                    react_1.default.createElement(react_native_1.Text, { style: styles.detailText },
                        "Time: ",
                        safeStringify(selectedRequest.timestamp))),
                selectedRequest.requestHeaders &&
                    Object.keys(selectedRequest.requestHeaders).length > 0 && (react_1.default.createElement(react_native_1.View, { style: styles.section },
                    react_1.default.createElement(react_native_1.Text, { style: styles.sectionTitle }, "Request Headers"),
                    Object.entries(selectedRequest.requestHeaders).map(([key, value]) => (react_1.default.createElement(react_native_1.Text, { key: key, style: styles.headerText },
                        safeStringify(key),
                        ": ",
                        safeStringify(value)))))),
                selectedRequest.requestBody && (react_1.default.createElement(react_native_1.View, { style: styles.section },
                    react_1.default.createElement(react_native_1.Text, { style: styles.sectionTitle }, "Request Body"),
                    react_1.default.createElement(react_native_1.Text, { style: styles.bodyText }, safeStringify(selectedRequest.requestBody)))),
                selectedRequest.responseHeaders &&
                    Object.keys(selectedRequest.responseHeaders).length > 0 && (react_1.default.createElement(react_native_1.View, { style: styles.section },
                    react_1.default.createElement(react_native_1.Text, { style: styles.sectionTitle }, "Response Headers"),
                    Object.entries(selectedRequest.responseHeaders).map(([key, value]) => (react_1.default.createElement(react_native_1.Text, { key: key, style: styles.headerText },
                        safeStringify(key),
                        ": ",
                        safeStringify(value)))))),
                selectedRequest.responseBody && (react_1.default.createElement(react_native_1.View, { style: styles.section },
                    react_1.default.createElement(react_native_1.Text, { style: styles.sectionTitle }, "Response Body"),
                    react_1.default.createElement(react_native_1.Text, { style: styles.bodyText }, safeStringify(selectedRequest.responseBody))))),
            react_1.default.createElement(react_native_1.View, { style: styles.detailsFooter },
                react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.copyCurlButton, onPress: () => handleCopyCurl(selectedRequest) },
                    react_1.default.createElement(react_native_1.View, { style: styles.buttonContent },
                        react_1.default.createElement(SmartIcon_1.Icon, { name: "content-copy", size: 18, color: "#fff" }),
                        react_1.default.createElement(react_native_1.Text, { style: styles.copyCurlButtonText }, "Copy as cURL"))))));
    };
    return (react_1.default.createElement(react_native_1.Modal, { animationType: "slide", transparent: false, visible: visible, onRequestClose: onClose },
        react_1.default.createElement(react_native_1.SafeAreaView, { style: { flex: 1, height: "100%", width: "100%" } },
            selectedRequest ? (renderRequestDetails()) : (react_1.default.createElement(react_native_1.View, { style: styles.container },
                react_1.default.createElement(react_native_1.View, { style: styles.header },
                    react_1.default.createElement(react_native_1.View, { style: styles.headerLeft },
                        react_1.default.createElement(react_native_1.Text, { style: styles.title }, "Network Debugger"),
                        react_1.default.createElement(react_native_1.Text, { style: styles.subtitle },
                            data.length,
                            " requests")),
                    onClose && (react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.headerCloseButton, onPress: onClose },
                        react_1.default.createElement(SmartIcon_1.Icon, { name: "close", size: 24, color: "#666" })))),
                react_1.default.createElement(react_native_1.FlatList, { data: data.slice().reverse(), keyExtractor: (item) => item.id, renderItem: renderRequestItem, showsVerticalScrollIndicator: false, contentContainerStyle: styles.listContainer, ListEmptyComponent: react_1.default.createElement(react_native_1.View, { style: { padding: 40, alignItems: "center" } },
                        react_1.default.createElement(react_native_1.Text, { style: { color: "#999", fontSize: 16 } }, "No network requests yet"),
                        react_1.default.createElement(react_native_1.Text, { style: { color: "#999", fontSize: 14, marginTop: 8 } }, "Start making API calls to see them here")) }),
                react_1.default.createElement(react_native_1.View, { style: styles.footer },
                    react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.clearButton, onPress: handleClear },
                        react_1.default.createElement(react_native_1.View, { style: styles.buttonContent },
                            react_1.default.createElement(SmartIcon_1.Icon, { name: "delete", size: 18, color: "#fff" }),
                            react_1.default.createElement(react_native_1.Text, { style: styles.clearButtonText }, "Clear All")))))),
            react_1.default.createElement(Toast_1.ToastContainer, null))));
};
exports.default = NetworkDebugger;
const styles = react_native_1.StyleSheet.create({
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
        paddingBottom: 80,
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
        marginTop: 16,
    },
    copyCurlButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
