import { NetworkRequest } from "../domain/models/NetworkRequest";
/**
 * Generates a curl command from a NetworkRequest
 */
export declare const generateCurlCommand: (request: NetworkRequest) => string;
/**
 * Simple clipboard copy without external dependencies
 */
export declare const simpleCopyToClipboard: (text: string) => boolean;
/**
 * Copies text to clipboard (React Native compatible)
 */
export declare const copyToClipboard: (text: string) => Promise<boolean>;
/**
 * Formats duration for display
 */
export declare const formatDuration: (duration?: number) => string;
/**
 * Formats timestamp for display
 */
export declare const formatTimestamp: (timestamp: string) => string;
/**
 * Gets status color based on HTTP status code
 */
export declare const getStatusColor: (status?: number) => string;
