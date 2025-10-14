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
exports.showErrorToast = exports.showSuccessToast = exports.showToast = exports.ToastContainer = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
class ToastManager {
    constructor() {
        this.toastRef = null;
    }
    static getInstance() {
        if (!ToastManager.instance) {
            ToastManager.instance = new ToastManager();
        }
        return ToastManager.instance;
    }
    setToastRef(ref) {
        this.toastRef = ref;
    }
    show(config) {
        var _a;
        if ((_a = this.toastRef) === null || _a === void 0 ? void 0 : _a.current) {
            this.toastRef.current.show(config);
        }
    }
}
const ToastContainer = () => {
    const [visible, setVisible] = (0, react_1.useState)(false);
    const [config, setConfig] = (0, react_1.useState)(null);
    const toastManager = ToastManager.getInstance();
    const toastRef = react_1.default.useRef({
        show: (newConfig) => {
            setConfig(newConfig);
            setVisible(true);
            setTimeout(() => {
                setVisible(false);
            }, newConfig.duration);
        }
    });
    (0, react_1.useEffect)(() => {
        toastManager.setToastRef(toastRef);
    }, []);
    if (!visible || !config)
        return null;
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
    return (react_1.default.createElement(react_native_1.View, { style: styles.toastContainer },
        react_1.default.createElement(react_native_1.View, { style: [styles.toast, getToastStyle()] },
            react_1.default.createElement(react_native_1.Text, { style: styles.icon }, getIcon()),
            react_1.default.createElement(react_native_1.Text, { style: styles.message }, config.message))));
};
exports.ToastContainer = ToastContainer;
const showToast = (message, duration = "SHORT") => {
    const toastDuration = duration === "SHORT" ? 2000 : 4000;
    ToastManager.getInstance().show({
        message,
        type: 'info',
        duration: toastDuration
    });
};
exports.showToast = showToast;
const showSuccessToast = (message) => {
    ToastManager.getInstance().show({
        message,
        type: 'success',
        duration: 2000
    });
};
exports.showSuccessToast = showSuccessToast;
const showErrorToast = (message) => {
    ToastManager.getInstance().show({
        message,
        type: 'error',
        duration: 3000
    });
};
exports.showErrorToast = showErrorToast;
const { width } = react_native_1.Dimensions.get('window');
const styles = react_native_1.StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: react_native_1.Platform.OS === 'ios' ? 60 : 40,
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
