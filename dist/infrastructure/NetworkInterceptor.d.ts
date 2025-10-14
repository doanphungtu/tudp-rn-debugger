import { NetworkRequest } from "../domain/models/NetworkRequest";
interface StartNetworkLoggingOptions {
    force?: boolean;
    maxRequests?: number;
    ignoredHosts?: string[];
    ignoredUrls?: string[];
    ignoredPatterns?: RegExp[];
}
export declare const startNetworkLogging: (options?: StartNetworkLoggingOptions) => void;
export declare const stopNetworkLogging: () => void;
export declare const getRequests: () => NetworkRequest[];
export declare const clearRequests: () => void;
export declare const getDebugInfo: () => {
    isLogging: boolean;
    hasXHRInterceptor: boolean;
    hasOriginalFetch: boolean;
    requestCount: number;
    maxRequests: number;
    interceptorEnabled: boolean;
    ignoredHosts: string[] | undefined;
    ignoredUrls: string[] | undefined;
    ignoredPatterns: string[] | undefined;
};
export declare const testInterceptor: () => Promise<boolean>;
export declare const addCallback: (callback: (requests: NetworkRequest[]) => void) => void;
export declare const removeCallback: (callback: (requests: NetworkRequest[]) => void) => void;
export { StartNetworkLoggingOptions };
