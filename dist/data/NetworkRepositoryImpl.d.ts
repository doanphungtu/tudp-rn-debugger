import { NetworkRepository } from '../domain/repositories/NetworkRepository';
import { NetworkRequest } from '../domain/models/NetworkRequest';
export declare class NetworkRepositoryImpl implements NetworkRepository {
    private requests;
    addRequest(request: NetworkRequest): void;
    getRequests(): NetworkRequest[];
    clear(): void;
}
