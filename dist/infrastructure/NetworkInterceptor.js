"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRequests = exports.getRequests = exports.stopNetworkLogging = exports.startNetworkLogging = void 0;
const NetworkRepositoryImpl_1 = require("../data/NetworkRepositoryImpl");
const generateId_1 = require("../utils/generateId");
const repo = new NetworkRepositoryImpl_1.NetworkRepositoryImpl();
let originalFetch = null;
let isLogging = false;
/**
 * Bắt đầu ghi log network request
 * @param options.force - ép ghi đè fetch hiện tại (kể cả khi đã bị Reactotron patch)
 */
const startNetworkLogging = (options) => {
    var _a, _b;
    const force = (_a = options === null || options === void 0 ? void 0 : options.force) !== null && _a !== void 0 ? _a : false;
    // Nếu đã khởi động mà không yêu cầu force thì thoát
    if (isLogging && !force) {
        console.warn("[tudp-rn-debugger] Network logging already active");
        return;
    }
    // Nếu đang bật mà người dùng yêu cầu force => ghi đè lại fetch
    if (isLogging && force) {
        console.log("[tudp-rn-debugger] Forcing restart of network logging...");
        (0, exports.stopNetworkLogging)();
    }
    // Lưu fetch gốc (nếu chưa lưu)
    const currentFetch = global.fetch;
    if (!originalFetch) {
        // @ts-ignore
        originalFetch = (_b = currentFetch === null || currentFetch === void 0 ? void 0 : currentFetch.bind(global)) !== null && _b !== void 0 ? _b : null;
        // Lưu fetch gốc toàn cục để khôi phục sau
        global.__ORIGINAL_FETCH__ = originalFetch;
    }
    if (!originalFetch) {
        console.warn("[tudp-rn-debugger] No fetch found to patch.");
        return;
    }
    // Nếu fetch hiện tại khác với bản gốc và force = false => có thể do Reactotron
    if (currentFetch !== originalFetch && !force) {
        console.warn("[tudp-rn-debugger] Detected existing fetch patch (e.g. Reactotron). Pass { force: true } to override.");
        return;
    }
    console.log(`[tudp-rn-debugger] Starting network logging ${force ? "(force mode)" : ""}...`);
    // @ts-ignore
    global.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : input === null || input === void 0 ? void 0 : input.url;
        const id = (0, generateId_1.generateId)();
        const start = Date.now();
        const req = {
            id,
            url: String(url),
            method: (init && init.method) || "GET",
            startTime: start,
        };
        try {
            const res = await originalFetch(input, init);
            let resText = null;
            try {
                // @ts-ignore
                const clone = res.clone ? res.clone() : res;
                resText = await clone.text();
            }
            catch (e) {
                resText = "[binary]";
            }
            const end = Date.now();
            req.status = res.status;
            req.endTime = end;
            req.duration = end - start;
            req.responseBody = resText;
            repo.addRequest(req);
            return res;
        }
        catch (err) {
            const end = Date.now();
            req.endTime = end;
            req.duration = end - start;
            req.responseBody = String(err);
            repo.addRequest(req);
            throw err;
        }
    };
    isLogging = true;
};
exports.startNetworkLogging = startNetworkLogging;
/**
 * Dừng ghi log network
 */
const stopNetworkLogging = () => {
    if (!originalFetch) {
        console.warn("[tudp-rn-debugger] No original fetch to restore");
        return;
    }
    // @ts-ignore
    global.fetch = originalFetch;
    isLogging = false;
    console.log("[tudp-rn-debugger] Network logging stopped");
};
exports.stopNetworkLogging = stopNetworkLogging;
const getRequests = () => repo.getRequests();
exports.getRequests = getRequests;
const clearRequests = () => repo.clear();
exports.clearRequests = clearRequests;
