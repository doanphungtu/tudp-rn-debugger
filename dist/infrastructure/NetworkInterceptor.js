"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRequests = exports.getRequests = exports.stopNetworkLogging = exports.startNetworkLogging = void 0;
const NetworkRepositoryImpl_1 = require("../data/NetworkRepositoryImpl");
const generateId_1 = require("../utils/generateId");
const repo = new NetworkRepositoryImpl_1.NetworkRepositoryImpl();
let originalFetch = null;
const startNetworkLogging = () => {
    var _a, _b;
    if (originalFetch)
        return; // already started
    // @ts-ignore
    originalFetch = (_b = (_a = global.fetch) === null || _a === void 0 ? void 0 : _a.bind(global)) !== null && _b !== void 0 ? _b : null;
    if (!originalFetch)
        return;
    // @ts-ignore
    global.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input === null || input === void 0 ? void 0 : input.url;
        const id = (0, generateId_1.generateId)();
        const start = Date.now();
        const req = {
            id,
            url: String(url),
            method: (init && init.method) || 'GET',
            startTime: start
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
                resText = '[binary]';
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
};
exports.startNetworkLogging = startNetworkLogging;
const stopNetworkLogging = () => {
    if (!originalFetch)
        return;
    // @ts-ignore
    global.fetch = originalFetch;
    originalFetch = null;
};
exports.stopNetworkLogging = stopNetworkLogging;
const getRequests = () => repo.getRequests();
exports.getRequests = getRequests;
const clearRequests = () => repo.clear();
exports.clearRequests = clearRequests;
