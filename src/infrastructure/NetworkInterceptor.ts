import { NetworkRepositoryImpl } from "../data/NetworkRepositoryImpl";
import { NetworkRequest } from "../domain/models/NetworkRequest";
import { generateId } from "../utils/generateId";

const repo = new NetworkRepositoryImpl();

let originalFetch: typeof fetch | null = null;
let isLogging = false;

interface StartNetworkLoggingOptions {
  force?: boolean;
}

/**
 * Bắt đầu ghi log network request
 * @param options.force - ép ghi đè fetch hiện tại (kể cả khi đã bị Reactotron patch)
 */
export const startNetworkLogging = (options?: StartNetworkLoggingOptions) => {
  const force = options?.force ?? false;

  // Nếu đã khởi động mà không yêu cầu force thì thoát
  if (isLogging && !force) {
    console.warn("[tudp-rn-debugger] Network logging already active");
    return;
  }

  // Nếu đang bật mà người dùng yêu cầu force => ghi đè lại fetch
  if (isLogging && force) {
    console.log("[tudp-rn-debugger] Forcing restart of network logging...");
    stopNetworkLogging();
  }

  // Lưu fetch gốc (nếu chưa lưu)
  const currentFetch = (global as any).fetch;
  if (!originalFetch) {
    // @ts-ignore
    originalFetch = currentFetch?.bind(global) ?? null;
    // Lưu fetch gốc toàn cục để khôi phục sau
    (global as any).__ORIGINAL_FETCH__ = originalFetch;
  }

  if (!originalFetch) {
    console.warn("[tudp-rn-debugger] No fetch found to patch.");
    return;
  }

  // Nếu fetch hiện tại khác với bản gốc và force = false => có thể do Reactotron
  if (currentFetch !== originalFetch && !force) {
    console.warn(
      "[tudp-rn-debugger] Detected existing fetch patch (e.g. Reactotron). Pass { force: true } to override."
    );
    return;
  }

  console.log(
    `[tudp-rn-debugger] Starting network logging ${
      force ? "(force mode)" : ""
    }...`
  );

  // @ts-ignore
  (global as any).fetch = async (input: any, init?: any) => {
    const url = typeof input === "string" ? input : input?.url;
    const id = generateId();
    const start = Date.now();
    const req: NetworkRequest = {
      id,
      url: String(url),
      method: (init && init.method) || "GET",
      startTime: start,
    };

    try {
      const res = await originalFetch!(input, init);
      let resText: string | null = null;
      try {
        // @ts-ignore
        const clone = res.clone ? res.clone() : res;
        resText = await clone.text();
      } catch (e) {
        resText = "[binary]";
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

  isLogging = true;
};

/**
 * Dừng ghi log network
 */
export const stopNetworkLogging = () => {
  if (!originalFetch) {
    console.warn("[tudp-rn-debugger] No original fetch to restore");
    return;
  }
  // @ts-ignore
  (global as any).fetch = originalFetch;
  isLogging = false;
  console.log("[tudp-rn-debugger] Network logging stopped");
};

export const getRequests = (): NetworkRequest[] => repo.getRequests();
export const clearRequests = (): void => repo.clear();
