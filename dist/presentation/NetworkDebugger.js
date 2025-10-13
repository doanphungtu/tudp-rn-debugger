"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const NetworkInterceptor_1 = require("../infrastructure/NetworkInterceptor");
const NetworkDebugger = () => {
    const [data, setData] = react_1.default.useState((0, NetworkInterceptor_1.getRequests)());
    react_1.default.useEffect(() => {
        const id = setInterval(() => {
            setData((0, NetworkInterceptor_1.getRequests)());
        }, 500);
        return () => clearInterval(id);
    }, []);
    return (react_1.default.createElement(react_native_1.View, { style: styles.container },
        react_1.default.createElement(react_native_1.Text, { style: styles.header }, "Network Debugger"),
        react_1.default.createElement(react_native_1.FlatList, { data: data, keyExtractor: (item) => item.id, renderItem: ({ item }) => {
                var _a, _b;
                return (react_1.default.createElement(react_native_1.View, { style: styles.item },
                    react_1.default.createElement(react_native_1.Text, { style: styles.method },
                        item.method,
                        " ",
                        item.url),
                    react_1.default.createElement(react_native_1.Text, null,
                        "Status: ", (_a = item.status) !== null && _a !== void 0 ? _a : '-'),
                    react_1.default.createElement(react_native_1.Text, null,
                        "Duration: ", (_b = item.duration) !== null && _b !== void 0 ? _b : 0,
                        " ms")));
            } }),
        react_1.default.createElement(react_native_1.View, { style: styles.footer },
            react_1.default.createElement(react_native_1.Text, { onPress: () => { (0, NetworkInterceptor_1.clearRequests)(); setData([]); }, style: styles.clear }, "Clear"))));
};
exports.default = NetworkDebugger;
const styles = react_native_1.StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
    item: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    method: { fontWeight: '600' },
    footer: { padding: 8, alignItems: 'center' },
    clear: { color: 'blue' }
});
