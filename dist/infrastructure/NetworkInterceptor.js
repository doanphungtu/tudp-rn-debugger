"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCallback = exports.addCallback = exports.testInterceptor = exports.getDebugInfo = exports.clearRequests = exports.getRequests = exports.stopNetworkLogging = exports.startNetworkLogging = void 0;
const generateId_1 = require("../utils/generateId");
// Try to get XHRInterceptor from React Native
let XHRInterceptor = null;
try {
    // React Native 0.80+
    const module = require("react-native/src/private/devsupport/devmenu/elementinspector/XHRInterceptor");
    XHRInterceptor = (_a = module.default) !== null && _a !== void 0 ? _a : module;
}
catch {
    try {
        // React Native 0.79+
        const module = require("react-native/src/private/inspector/XHRInterceptor");
        XHRInterceptor = (_b = module.default) !== null && _b !== void 0 ? _b : module;
    }
    catch {
        try {
            // React Native 0.78 and below
            const module = require("react-native/Libraries/Network/XHRInterceptor");
            XHRInterceptor = (_c = module.default) !== null && _c !== void 0 ? _c : module;
        }
        catch {
            console.warn("[tudp-rn-debugger] XHRInterceptor not found, falling back to fetch patching");
        }
    }
}
// Singleton Logger Class
class NetworkLogger {
    constructor() {
        this.requests = [];
        this.xhrIdMap = new Map();
        this.maxRequests = 500;
        this.isLogging = false;
        this.nextXHRId = 0;
        this.callbacks = [];
        // Fallback fetch patching
        this.originalFetch = null;
        // Debounced callback to prevent excessive updates
        this.debouncedNotify = this.debounce(() => {
            this.callbacks.forEach((callback) => {
                try {
                    callback([...this.requests]);
                }
                catch (error) {
                    console.error("[tudp-rn-debugger] Callback error:", error);
                }
            });
        }, 100);
    }
    debounce(func, wait) {
        let timeout;
        return ((...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        });
    }
    startNetworkLogging(options) {
        var _a;
        const force = (_a = options === null || options === void 0 ? void 0 : options.force) !== null && _a !== void 0 ? _a : false;
        try {
            // Start network logging
            if (this.isLogging && !(options === null || options === void 0 ? void 0 : options.force)) {
                console.warn("[tudp-rn-debugger] Network logging already active");
                return;
            }
            if ((options === null || options === void 0 ? void 0 : options.force) && this.isLogging) {
                // Force restart
                this.stopNetworkLogging();
            }
            // Apply options
            if ((options === null || options === void 0 ? void 0 : options.maxRequests) !== undefined) {
                this.maxRequests = Math.max(1, options.maxRequests);
            }
            if (options === null || options === void 0 ? void 0 : options.ignoredHosts) {
                this.ignoredHosts = new Set(options.ignoredHosts);
            }
            if (options === null || options === void 0 ? void 0 : options.ignoredUrls) {
                this.ignoredUrls = new Set(options.ignoredUrls);
            }
            if (options === null || options === void 0 ? void 0 : options.ignoredPatterns) {
                this.ignoredPatterns = options.ignoredPatterns;
            }
            // Try XHRInterceptor first, fallback to fetch patching
            if (XHRInterceptor) {
                this.enableXHRInterception(force);
            }
            else {
                this.enableFetchPatching(force);
            }
            this.isLogging = true;
        }
        catch (error) {
            console.error("[tudp-rn-debugger] Failed to start network logging:", error);
        }
    }
    enableXHRInterception(force) {
        if (!XHRInterceptor)
            return false;
        // Check if another interceptor is already enabled
        if (XHRInterceptor.isInterceptorEnabled() && !force) {
            console.warn("[tudp-rn-debugger] Another network interceptor is active (e.g., Reactotron). Use { force: true } to override.");
            return false;
        }
        try {
            // Set up callbacks
            XHRInterceptor.setOpenCallback(this.onXHROpen.bind(this));
            XHRInterceptor.setRequestHeaderCallback(this.onXHRRequestHeader.bind(this));
            XHRInterceptor.setSendCallback(this.onXHRSend.bind(this));
            XHRInterceptor.setHeaderReceivedCallback(this.onXHRHeaderReceived.bind(this));
            XHRInterceptor.setResponseCallback(this.onXHRResponse.bind(this));
            // Enable interception
            XHRInterceptor.enableInterception();
            return true;
        }
        catch (error) {
            console.error("[tudp-rn-debugger] Failed to enable XHRInterceptor:", error);
            return false;
        }
    }
    enableFetchPatching(force) {
        // Get global object
        let globalObject;
        if (typeof global !== "undefined") {
            globalObject = global;
        }
        else if (typeof window !== "undefined") {
            globalObject = window;
        }
        else if (typeof self !== "undefined") {
            globalObject = self;
        }
        else {
            console.error("[tudp-rn-debugger] Could not find global object");
            return false;
        }
        const currentFetch = globalObject.fetch;
        if (!currentFetch) {
            console.error("[tudp-rn-debugger] No fetch found to patch");
            return false;
        }
        // Save original fetch if not already saved
        if (!this.originalFetch) {
            this.originalFetch = currentFetch.bind(globalObject);
        }
        // Check if fetch is already patched and force is not enabled
        if (currentFetch !== this.originalFetch && !force) {
            console.warn("[tudp-rn-debugger] Fetch already patched (e.g., by Reactotron). Use { force: true } to override.");
            return false;
        }
        // Patch fetch
        globalObject.fetch = this.createFetchWrapper();
        return true;
    }
    createFetchWrapper() {
        return async (input, init) => {
            const url = typeof input === "string" ? input : input === null || input === void 0 ? void 0 : input.url;
            const method = ((init === null || init === void 0 ? void 0 : init.method) || "GET").toUpperCase();
            // Apply filters
            if (this.shouldIgnoreRequest(method, url)) {
                return this.originalFetch(input, init);
            }
            const id = (0, generateId_1.generateId)();
            const startTime = Date.now();
            const timestamp = new Date(startTime).toISOString();
            // Extract request headers and body
            const requestHeaders = this.extractRequestHeaders(init === null || init === void 0 ? void 0 : init.headers);
            const requestBody = this.extractRequestBody(init === null || init === void 0 ? void 0 : init.body);
            const request = {
                id,
                url: String(url),
                method,
                startTime,
                timestamp,
                requestHeaders,
                requestBody,
            };
            try {
                const response = await this.originalFetch(input, init);
                // Extract response details
                const responseHeaders = this.extractResponseHeaders(response.headers);
                const endTime = Date.now();
                // Clone response to read body
                let responseBody = null;
                try {
                    const clone = response.clone();
                    responseBody = await clone.text();
                }
                catch (e) {
                    responseBody = "[binary or unreadable]";
                }
                // Update request with response data
                Object.assign(request, {
                    status: response.status,
                    endTime,
                    duration: endTime - startTime,
                    responseHeaders,
                    responseBody,
                });
                this.addRequest(request);
                return response;
            }
            catch (error) {
                const endTime = Date.now();
                Object.assign(request, {
                    endTime,
                    duration: endTime - startTime,
                    error: String(error),
                    responseBody: String(error),
                });
                this.addRequest(request);
                throw error;
            }
        };
    }
    // XHR Interceptor callbacks
    onXHROpen(method, url, xhr) {
        if (this.shouldIgnoreRequest(method, url)) {
            return;
        }
        xhr._index = this.nextXHRId++;
        this.xhrIdMap.set(xhr._index, () => {
            return this.requests.findIndex((r) => r.id === `${xhr._index}`);
        });
        const request = {
            id: `${xhr._index}`,
            url,
            method: method.toUpperCase(),
            startTime: Date.now(),
            timestamp: new Date().toISOString(),
            requestHeaders: {},
        };
        this.addRequest(request);
    }
    onXHRRequestHeader(header, value, xhr) {
        const request = this.getRequest(xhr._index);
        if (!request)
            return;
        if (!request.requestHeaders) {
            request.requestHeaders = {};
        }
        request.requestHeaders[header] = value;
    }
    onXHRSend(data, xhr) {
        const request = this.getRequest(xhr._index);
        if (!request)
            return;
        request.requestBody = data || null;
        request.startTime = Date.now();
        this.debouncedNotify();
    }
    onXHRHeaderReceived(responseContentType, responseSize, responseHeaders, xhr) {
        const request = this.getRequest(xhr._index);
        if (!request)
            return;
        request.responseHeaders = xhr.responseHeaders || responseHeaders || {};
    }
    onXHRResponse(status, timeout, response, responseURL, responseType, xhr) {
        const request = this.getRequest(xhr._index);
        if (!request)
            return;
        const endTime = Date.now();
        Object.assign(request, {
            status,
            endTime,
            duration: endTime - request.startTime,
            responseBody: response,
        });
        this.debouncedNotify();
    }
    getRequest(xhrIndex) {
        if (!this.xhrIdMap.has(xhrIndex))
            return undefined;
        const index = this.xhrIdMap.get(xhrIndex)();
        return this.requests[index];
    }
    shouldIgnoreRequest(method, url) {
        // Check ignored hosts
        if (this.ignoredHosts) {
            try {
                const hostname = new URL(url).hostname;
                if (this.ignoredHosts.has(hostname)) {
                    return true;
                }
            }
            catch (e) {
                // Invalid URL, continue
            }
        }
        // Check ignored URLs
        if (this.ignoredUrls && this.ignoredUrls.has(url)) {
            return true;
        }
        // Check ignored patterns
        if (this.ignoredPatterns) {
            const requestString = `${method} ${url}`;
            if (this.ignoredPatterns.some((pattern) => pattern.test(requestString))) {
                return true;
            }
        }
        return false;
    }
    extractRequestHeaders(headers) {
        const result = {};
        if (!headers)
            return result;
        try {
            if (headers instanceof Headers) {
                headers.forEach((value, key) => {
                    result[key] = value;
                });
            }
            else if (typeof headers === "object") {
                Object.assign(result, headers);
            }
        }
        catch (e) {
            console.warn("[tudp-rn-debugger] Failed to extract request headers:", e);
        }
        return result;
    }
    extractResponseHeaders(headers) {
        const result = {};
        if (!headers)
            return result;
        try {
            if (typeof headers.forEach === "function") {
                headers.forEach((value, key) => {
                    result[key] = value;
                });
            }
        }
        catch (e) {
            console.warn("[tudp-rn-debugger] Failed to extract response headers:", e);
        }
        return result;
    }
    extractRequestBody(body) {
        if (!body)
            return null;
        try {
            if (typeof body === "string") {
                return body;
            }
            else if (body instanceof FormData) {
                return "[FormData]";
            }
            else if (body instanceof URLSearchParams) {
                return body.toString();
            }
            else if (body instanceof ArrayBuffer) {
                return "[ArrayBuffer]";
            }
            else {
                return String(body);
            }
        }
        catch (e) {
            return "[Unable to parse body]";
        }
    }
    addRequest(request) {
        this.requests.unshift(request);
        // Limit requests to maxRequests
        if (this.requests.length > this.maxRequests) {
            this.requests.pop();
        }
        this.debouncedNotify();
    }
    stopNetworkLogging() {
        if (!this.isLogging) {
            console.warn("[tudp-rn-debugger] Network logging is not active");
            return;
        }
        try {
            // Disable XHR interception if available
            if (XHRInterceptor) {
                XHRInterceptor.disableInterception();
            }
            // Restore original fetch if patched
            if (this.originalFetch) {
                let globalObject;
                if (typeof global !== "undefined") {
                    globalObject = global;
                }
                else if (typeof window !== "undefined") {
                    globalObject = window;
                }
                else if (typeof self !== "undefined") {
                    globalObject = self;
                }
                if (globalObject) {
                    globalObject.fetch = this.originalFetch;
                }
            }
            this.isLogging = false;
            this.xhrIdMap.clear();
        }
        catch (error) {
            console.error("[tudp-rn-debugger] Error stopping network logging:", error);
        }
    }
    getRequests() {
        return [...this.requests];
    }
    clearRequests() {
        this.requests = [];
        this.debouncedNotify();
    }
    addCallback(callback) {
        this.callbacks.push(callback);
    }
    removeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }
    getDebugInfo() {
        var _a;
        return {
            isLogging: this.isLogging,
            hasXHRInterceptor: !!XHRInterceptor,
            hasOriginalFetch: !!this.originalFetch,
            requestCount: this.requests.length,
            maxRequests: this.maxRequests,
            interceptorEnabled: XHRInterceptor
                ? XHRInterceptor.isInterceptorEnabled()
                : false,
            ignoredHosts: this.ignoredHosts
                ? Array.from(this.ignoredHosts)
                : undefined,
            ignoredUrls: this.ignoredUrls ? Array.from(this.ignoredUrls) : undefined,
            ignoredPatterns: (_a = this.ignoredPatterns) === null || _a === void 0 ? void 0 : _a.map((p) => p.toString()),
        };
    }
    async testInterceptor() {
        console.log("[tudp-rn-debugger] Testing interceptor...");
        const debugInfo = this.getDebugInfo();
        console.log("[tudp-rn-debugger] Debug info:", debugInfo);
        try {
            const response = await fetch("https://httpbin.org/get?test=tudp-debugger");
            console.log("[tudp-rn-debugger] Test request completed, status:", response.status);
            return true;
        }
        catch (error) {
            console.error("[tudp-rn-debugger] Test request failed:", error);
            return false;
        }
    }
}
// Create singleton instance
const logger = new NetworkLogger();
// Export public API
const startNetworkLogging = (options) => {
    logger.startNetworkLogging(options);
};
exports.startNetworkLogging = startNetworkLogging;
const stopNetworkLogging = () => {
    logger.stopNetworkLogging();
};
exports.stopNetworkLogging = stopNetworkLogging;
const getRequests = () => {
    return logger.getRequests();
};
exports.getRequests = getRequests;
const clearRequests = () => {
    logger.clearRequests();
};
exports.clearRequests = clearRequests;
const getDebugInfo = () => {
    return logger.getDebugInfo();
};
exports.getDebugInfo = getDebugInfo;
const testInterceptor = async () => {
    return logger.testInterceptor();
};
exports.testInterceptor = testInterceptor;
const addCallback = (callback) => {
    logger.addCallback(callback);
};
exports.addCallback = addCallback;
const removeCallback = (callback) => {
    logger.removeCallback(callback);
};
exports.removeCallback = removeCallback;
