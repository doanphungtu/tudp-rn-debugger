"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkRepositoryImpl = void 0;
class NetworkRepositoryImpl {
    constructor() {
        this.requests = [];
    }
    addRequest(request) {
        // unshift to keep newest first
        this.requests.unshift(request);
        // optional: cap size (not implemented here)
    }
    getRequests() {
        return this.requests;
    }
    clear() {
        this.requests = [];
    }
}
exports.NetworkRepositoryImpl = NetworkRepositoryImpl;
