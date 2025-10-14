import { NetworkRepositoryImpl } from "../data/NetworkRepositoryImpl";
import { NetworkRequest } from "../domain/models/NetworkRequest";
import { generateId } from "../utils/generateId";

// XHR Interceptor types
type XHRInterceptorModule = {
  isInterceptorEnabled: () => boolean;
  setOpenCallback: (...props: any[]) => void;
  setRequestHeaderCallback: (...props: any[]) => void;
  setSendCallback: (...props: any[]) => void;
  setHeaderReceivedCallback: (...props: any[]) => void;
  setResponseCallback: (...props: any[]) => void;
  enableInterception: () => void;
  disableInterception: () => void;
};

type XHR = {
  _index: number;
  responseHeaders?: Record<string, string>;
};

// Try to get XHRInterceptor from React Native
let XHRInterceptor: XHRInterceptorModule | null = null;

try {
  // React Native 0.80+
  const module = require('react-native/src/private/devsupport/devmenu/elementinspector/XHRInterceptor');
  XHRInterceptor = module.default ?? module;
} catch {
  try {
    // React Native 0.79+
    const module = require('react-native/src/private/inspector/XHRInterceptor');
    XHRInterceptor = module.default ?? module;
  } catch {
    try {
      // React Native 0.78 and below
      const module = require('react-native/Libraries/Network/XHRInterceptor');
      XHRInterceptor = module.default ?? module;
    } catch {
      console.warn('[tudp-rn-debugger] XHRInterceptor not found, falling back to fetch patching');
    }
  }
}

// Configuration interface
interface StartNetworkLoggingOptions {
  force?: boolean;
  maxRequests?: number;
  ignoredHosts?: string[];
  ignoredUrls?: string[];
  ignoredPatterns?: RegExp[];
}

// Singleton Logger Class
class NetworkLogger {
  private requests: NetworkRequest[] = [];
  private xhrIdMap: Map<number, () => number> = new Map();
  private maxRequests: number = 500;
  private ignoredHosts: Set<string> | undefined;
  private ignoredUrls: Set<string> | undefined;
  private ignoredPatterns: RegExp[] | undefined;
  private isLogging = false;
  private nextXHRId = 0;
  private callbacks: Array<(requests: NetworkRequest[]) => void> = [];
  
  // Fallback fetch patching
  private originalFetch: typeof fetch | null = null;

  // Debounced callback to prevent excessive updates
  private debouncedNotify = this.debounce(() => {
    this.callbacks.forEach(callback => {
      try {
        callback([...this.requests]);
      } catch (error) {
        console.error('[tudp-rn-debugger] Callback error:', error);
      }
    });
  }, 100);

  private debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  }

  public startNetworkLogging(options?: StartNetworkLoggingOptions) {
    const force = options?.force ?? false;

    console.log("[tudp-rn-debugger] Starting network logging...", {
      force,
      isLogging: this.isLogging,
      hasXHRInterceptor: !!XHRInterceptor
    });

    // If already enabled and not forcing, warn and return
    if (this.isLogging && !force) {
      console.warn("[tudp-rn-debugger] Network logging already active");
      return;
    }

    // If forcing restart, stop first
    if (this.isLogging && force) {
      console.log("[tudp-rn-debugger] Forcing restart...");
      this.stopNetworkLogging();
    }

    // Apply options
    if (options?.maxRequests !== undefined) {
      this.maxRequests = Math.max(1, options.maxRequests);
    }

    if (options?.ignoredHosts) {
      this.ignoredHosts = new Set(options.ignoredHosts);
    }

    if (options?.ignoredUrls) {
      this.ignoredUrls = new Set(options.ignoredUrls);
    }

    if (options?.ignoredPatterns) {
      this.ignoredPatterns = options.ignoredPatterns;
    }

    // Try XHRInterceptor first, fallback to fetch patching
    if (XHRInterceptor) {
      this.enableXHRInterception(force);
    } else {
      this.enableFetchPatching(force);
    }

    this.isLogging = true;
    console.log("[tudp-rn-debugger] Network logging started successfully!");
  }

  private enableXHRInterception(force: boolean) {
    if (!XHRInterceptor) return false;

    // Check if another interceptor is already enabled
    if (XHRInterceptor.isInterceptorEnabled() && !force) {
      console.warn(
        "[tudp-rn-debugger] Another network interceptor is active (e.g., Reactotron). Use { force: true } to override."
      );
      return false;
    }

    try {
      // Set up callbacks
      XHRInterceptor.setOpenCallback(this.onXHROpen.bind(this));
      XHRInterceptor.setRequestHeaderCallback(this.onXHRRequestHeader.bind(this));
      XHRInterceptor.setSendCallback(this.onXHRSend.bind(this));
      XHRInterceptor.setHeaderReceivedCallback(this.onXHRHeaderReceived.bind(this));
      XHRInterceptor.setResponseCallback(this.onXHRResponse.bind(this));

      // Enable interception
      XHRInterceptor.enableInterception();
      
      console.log("[tudp-rn-debugger] XHRInterceptor enabled successfully");
      return true;
    } catch (error) {
      console.error("[tudp-rn-debugger] Failed to enable XHRInterceptor:", error);
      return false;
    }
  }

  private enableFetchPatching(force: boolean) {
    // Get global object
    let globalObject: any;
    if (typeof global !== 'undefined') {
      globalObject = global;
    } else if (typeof window !== 'undefined') {
      globalObject = window;
    } else if (typeof self !== 'undefined') {
      globalObject = self;
    } else {
      console.error("[tudp-rn-debugger] Could not find global object");
      return false;
    }

    const currentFetch = globalObject.fetch;
    if (!currentFetch) {
      console.error("[tudp-rn-debugger] No fetch found to patch");
      return false;
    }

    // Save original fetch if not already saved
    if (!this.originalFetch) {
      this.originalFetch = currentFetch.bind(globalObject);
    }

    // Check if fetch is already patched and force is not enabled
    if (currentFetch !== this.originalFetch && !force) {
      console.warn(
        "[tudp-rn-debugger] Fetch already patched (e.g., by Reactotron). Use { force: true } to override."
      );
      return false;
    }

    // Patch fetch
    globalObject.fetch = this.createFetchWrapper();
    console.log("[tudp-rn-debugger] Fetch patching enabled successfully");
    return true;
  }

  private createFetchWrapper() {
    return async (input: any, init?: any) => {
      const url = typeof input === "string" ? input : input?.url;
      const method = (init?.method || "GET").toUpperCase();

      // Apply filters
      if (this.shouldIgnoreRequest(method, url)) {
        return this.originalFetch!(input, init);
      }

      const id = generateId();
      const startTime = Date.now();
      const timestamp = new Date(startTime).toISOString();

      console.log("[tudp-rn-debugger] Intercepted request:", { url, method, id });

      // Extract request headers and body
      const requestHeaders = this.extractRequestHeaders(init?.headers);
      const requestBody = this.extractRequestBody(init?.body);

      const request: NetworkRequest = {
        id,
        url: String(url),
        method,
        startTime,
        timestamp,
        requestHeaders,
        requestBody,
      };

      try {
        const response = await this.originalFetch!(input, init);
        
        // Extract response details
        const responseHeaders = this.extractResponseHeaders(response.headers);
        const endTime = Date.now();

        // Clone response to read body
        let responseBody: string | null = null;
        try {
          const clone = response.clone();
          responseBody = await clone.text();
        } catch (e) {
          responseBody = "[binary or unreadable]";
        }

        // Update request with response data
        Object.assign(request, {
          status: response.status,
          endTime,
          duration: endTime - startTime,
          responseHeaders,
          responseBody,
        });

        console.log("[tudp-rn-debugger] Request completed:", {
          url,
          status: response.status,
          duration: request.duration
        });

        this.addRequest(request);
        return response;

      } catch (error) {
        const endTime = Date.now();
        
        Object.assign(request, {
          endTime,
          duration: endTime - startTime,
          error: String(error),
          responseBody: String(error),
        });

        console.log("[tudp-rn-debugger] Request failed:", {
          url,
          error: String(error),
          duration: request.duration
        });

        this.addRequest(request);
        throw error;
      }
    };
  }

  // XHR Interceptor callbacks
  private onXHROpen(method: string, url: string, xhr: XHR) {
    if (this.shouldIgnoreRequest(method, url)) {
      return;
    }

    xhr._index = this.nextXHRId++;
    this.xhrIdMap.set(xhr._index, () => {
      return this.requests.findIndex(r => r.id === `${xhr._index}`);
    });

    const request: NetworkRequest = {
      id: `${xhr._index}`,
      url,
      method: method.toUpperCase(),
      startTime: Date.now(),
      timestamp: new Date().toISOString(),
      requestHeaders: {},
    };

    this.addRequest(request);
    console.log("[tudp-rn-debugger] XHR opened:", { method, url, id: request.id });
  }

  private onXHRRequestHeader(header: string, value: string, xhr: XHR) {
    const request = this.getRequest(xhr._index);
    if (!request) return;

    if (!request.requestHeaders) {
      request.requestHeaders = {};
    }
    request.requestHeaders[header] = value;
  }

  private onXHRSend(data: string, xhr: XHR) {
    const request = this.getRequest(xhr._index);
    if (!request) return;

    request.requestBody = data || null;
    request.startTime = Date.now();
    this.debouncedNotify();
  }

  private onXHRHeaderReceived(
    responseContentType: string,
    responseSize: number,
    responseHeaders: Record<string, string>,
    xhr: XHR
  ) {
    const request = this.getRequest(xhr._index);
    if (!request) return;

    request.responseHeaders = xhr.responseHeaders || responseHeaders || {};
  }

  private onXHRResponse(
    status: number,
    timeout: number,
    response: string,
    responseURL: string,
    responseType: string,
    xhr: XHR
  ) {
    const request = this.getRequest(xhr._index);
    if (!request) return;

    const endTime = Date.now();
    Object.assign(request, {
      status,
      endTime,
      duration: endTime - request.startTime,
      responseBody: response,
    });

    console.log("[tudp-rn-debugger] XHR completed:", {
      url: request.url,
      status,
      duration: request.duration
    });

    this.debouncedNotify();
  }

  private getRequest(xhrIndex: number): NetworkRequest | undefined {
    if (!this.xhrIdMap.has(xhrIndex)) return undefined;
    const index = this.xhrIdMap.get(xhrIndex)!();
    return this.requests[index];
  }

  private shouldIgnoreRequest(method: string, url: string): boolean {
    // Check ignored hosts
    if (this.ignoredHosts) {
      try {
        const hostname = new URL(url).hostname;
        if (this.ignoredHosts.has(hostname)) {
          return true;
        }
      } catch (e) {
        // Invalid URL, continue
      }
    }

    // Check ignored URLs
    if (this.ignoredUrls && this.ignoredUrls.has(url)) {
      return true;
    }

    // Check ignored patterns
    if (this.ignoredPatterns) {
      const requestString = `${method} ${url}`;
      if (this.ignoredPatterns.some(pattern => pattern.test(requestString))) {
        return true;
      }
    }

    return false;
  }

  private extractRequestHeaders(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    
    if (!headers) return result;

    try {
      if (headers instanceof Headers) {
        headers.forEach((value: string, key: string) => {
          result[key] = value;
        });
      } else if (typeof headers === 'object') {
        Object.assign(result, headers);
      }
    } catch (e) {
      console.warn('[tudp-rn-debugger] Failed to extract request headers:', e);
    }

    return result;
  }

  private extractResponseHeaders(headers: any): Record<string, string> {
    const result: Record<string, string> = {};
    
    if (!headers) return result;

    try {
      if (typeof headers.forEach === 'function') {
        headers.forEach((value: string, key: string) => {
          result[key] = value;
        });
      }
    } catch (e) {
      console.warn('[tudp-rn-debugger] Failed to extract response headers:', e);
    }

    return result;
  }

  private extractRequestBody(body: any): string | null {
    if (!body) return null;

    try {
      if (typeof body === 'string') {
        return body;
      } else if (body instanceof FormData) {
        return '[FormData]';
      } else if (body instanceof URLSearchParams) {
        return body.toString();
      } else if (body instanceof ArrayBuffer) {
        return '[ArrayBuffer]';
      } else {
        return String(body);
      }
    } catch (e) {
      return '[Unable to parse body]';
    }
  }

  private addRequest(request: NetworkRequest) {
    this.requests.unshift(request);
    
    // Limit requests to maxRequests
    if (this.requests.length > this.maxRequests) {
      this.requests.pop();
    }

    this.debouncedNotify();
  }

  public stopNetworkLogging() {
    if (!this.isLogging) {
      console.warn("[tudp-rn-debugger] Network logging is not active");
      return;
    }

    try {
      // Disable XHR interception if available
      if (XHRInterceptor) {
        XHRInterceptor.disableInterception();
        console.log("[tudp-rn-debugger] XHRInterceptor disabled");
      }

      // Restore original fetch if patched
      if (this.originalFetch) {
        let globalObject: any;
        if (typeof global !== 'undefined') {
          globalObject = global;
        } else if (typeof window !== 'undefined') {
          globalObject = window;
        } else if (typeof self !== 'undefined') {
          globalObject = self;
        }

        if (globalObject) {
          globalObject.fetch = this.originalFetch;
          console.log("[tudp-rn-debugger] Fetch restored");
        }
      }

      this.isLogging = false;
      this.xhrIdMap.clear();
      console.log("[tudp-rn-debugger] Network logging stopped");

    } catch (error) {
      console.error("[tudp-rn-debugger] Error stopping network logging:", error);
    }
  }

  public getRequests(): NetworkRequest[] {
    return [...this.requests];
  }

  public clearRequests(): void {
    this.requests = [];
    this.debouncedNotify();
  }

  public addCallback(callback: (requests: NetworkRequest[]) => void) {
    this.callbacks.push(callback);
  }

  public removeCallback(callback: (requests: NetworkRequest[]) => void) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  public getDebugInfo() {
    return {
      isLogging: this.isLogging,
      hasXHRInterceptor: !!XHRInterceptor,
      hasOriginalFetch: !!this.originalFetch,
      requestCount: this.requests.length,
      maxRequests: this.maxRequests,
      interceptorEnabled: XHRInterceptor ? XHRInterceptor.isInterceptorEnabled() : false,
      ignoredHosts: this.ignoredHosts ? Array.from(this.ignoredHosts) : undefined,
      ignoredUrls: this.ignoredUrls ? Array.from(this.ignoredUrls) : undefined,
      ignoredPatterns: this.ignoredPatterns?.map(p => p.toString()),
    };
  }

  public async testInterceptor(): Promise<boolean> {
    console.log("[tudp-rn-debugger] Testing interceptor...");
    const debugInfo = this.getDebugInfo();
    console.log("[tudp-rn-debugger] Debug info:", debugInfo);
    
    try {
      const response = await fetch('https://httpbin.org/get?test=tudp-debugger');
      console.log("[tudp-rn-debugger] Test request completed, status:", response.status);
      return true;
    } catch (error) {
      console.error("[tudp-rn-debugger] Test request failed:", error);
      return false;
    }
  }
}

// Create singleton instance
const logger = new NetworkLogger();

// Export public API
export const startNetworkLogging = (options?: StartNetworkLoggingOptions) => {
  logger.startNetworkLogging(options);
};

export const stopNetworkLogging = () => {
  logger.stopNetworkLogging();
};

export const getRequests = (): NetworkRequest[] => {
  return logger.getRequests();
};

export const clearRequests = (): void => {
  logger.clearRequests();
};

export const getDebugInfo = () => {
  return logger.getDebugInfo();
};

export const testInterceptor = async (): Promise<boolean> => {
  return logger.testInterceptor();
};

export const addCallback = (callback: (requests: NetworkRequest[]) => void) => {
  logger.addCallback(callback);
};

export const removeCallback = (callback: (requests: NetworkRequest[]) => void) => {
  logger.removeCallback(callback);
};

// For backward compatibility
export { StartNetworkLoggingOptions };