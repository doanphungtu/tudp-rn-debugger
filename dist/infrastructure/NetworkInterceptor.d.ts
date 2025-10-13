import { NetworkRequest } from "../domain/models/NetworkRequest";
interface StartNetworkLoggingOptions {
    force?: boolean;
}
/**
 * Bắt đầu ghi log network request
 * @param options.force - ép ghi đè fetch hiện tại (kể cả khi đã bị Reactotron patch)
 */
export declare const startNetworkLogging: (options?: StartNetworkLoggingOptions) => void;
/**
 * Dừng ghi log network
 */
export declare const stopNetworkLogging: () => void;
export declare const getRequests: () => NetworkRequest[];
export declare const clearRequests: () => void;
export {};
