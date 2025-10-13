import { NetworkRepositoryImpl } from '../data/NetworkRepositoryImpl';
import { NetworkRequest } from '../domain/models/NetworkRequest';
import { generateId } from '../utils/generateId';

const repo = new NetworkRepositoryImpl();

let originalFetch: typeof fetch | null = null;

export const startNetworkLogging = () => {
  if (originalFetch) return; // already started
  // @ts-ignore
  originalFetch = (global as any).fetch?.bind(global) ?? null;
  if (!originalFetch) return;

  // @ts-ignore
  (global as any).fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url;
    const id = generateId();
    const start = Date.now();
    const req: NetworkRequest = {
      id,
      url: String(url),
      method: (init && init.method) || 'GET',
      startTime: start
    };

    try {
      const res = await originalFetch!(input, init);
      let resText: string | null = null;
      try {
        // @ts-ignore
        const clone = res.clone ? res.clone() : res;
        resText = await clone.text();
      } catch (e) {
        resText = '[binary]';
      }
      const end = Date.now();
      req.status = res.status;
      req.endTime = end;
      req.duration = end - start;
      req.responseBody = resText;
      repo.addRequest(req);
      return res;
    } catch (err: any) {
      const end = Date.now();
      req.endTime = end;
      req.duration = end - start;
      req.responseBody = String(err);
      repo.addRequest(req);
      throw err;
    }
  };
};

export const stopNetworkLogging = () => {
  if (!originalFetch) return;
  // @ts-ignore
  (global as any).fetch = originalFetch;
  originalFetch = null;
};

export const getRequests = (): NetworkRequest[] => repo.getRequests();
export const clearRequests = (): void => repo.clear();
