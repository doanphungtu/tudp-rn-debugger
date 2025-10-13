import { NetworkRepository } from '../domain/repositories/NetworkRepository';
import { NetworkRequest } from '../domain/models/NetworkRequest';

export class NetworkRepositoryImpl implements NetworkRepository {
  private requests: NetworkRequest[] = [];

  addRequest(request: NetworkRequest): void {
    // unshift to keep newest first
    this.requests.unshift(request);
    // optional: cap size (not implemented here)
  }

  getRequests(): NetworkRequest[] {
    return this.requests;
  }

  clear(): void {
    this.requests = [];
  }
}
