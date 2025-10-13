import { NetworkRequest } from '../domain/models/NetworkRequest';
export declare const startNetworkLogging: () => void;
export declare const stopNetworkLogging: () => void;
export declare const getRequests: () => NetworkRequest[];
export declare const clearRequests: () => void;
