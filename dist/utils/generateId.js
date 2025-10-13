"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = void 0;
const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
exports.generateId = generateId;
