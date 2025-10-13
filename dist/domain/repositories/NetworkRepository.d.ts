import { NetworkRequest } from '../models/NetworkRequest';
export interface NetworkRepository {
    addRequest(request: NetworkRequest): void;
    getRequests(): NetworkRequest[];
    clear(): void;
}
