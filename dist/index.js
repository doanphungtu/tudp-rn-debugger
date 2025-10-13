"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkDebugger = exports.clearRequests = exports.getRequests = exports.stopNetworkLogging = exports.startNetworkLogging = void 0;
var NetworkInterceptor_1 = require("./infrastructure/NetworkInterceptor");
Object.defineProperty(exports, "startNetworkLogging", { enumerable: true, get: function () { return NetworkInterceptor_1.startNetworkLogging; } });
Object.defineProperty(exports, "stopNetworkLogging", { enumerable: true, get: function () { return NetworkInterceptor_1.stopNetworkLogging; } });
Object.defineProperty(exports, "getRequests", { enumerable: true, get: function () { return NetworkInterceptor_1.getRequests; } });
Object.defineProperty(exports, "clearRequests", { enumerable: true, get: function () { return NetworkInterceptor_1.clearRequests; } });
var NetworkDebugger_1 = require("./presentation/NetworkDebugger");
Object.defineProperty(exports, "NetworkDebugger", { enumerable: true, get: function () { return __importDefault(NetworkDebugger_1).default; } });
