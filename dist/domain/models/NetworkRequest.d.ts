export interface NetworkRequest {
    id: string;
    url: string;
    method: string;
    status?: number;
    duration?: number;
    requestBody?: string | null;
    responseBody?: string | null;
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    startTime: number;
    endTime?: number;
    timestamp: string;
    error?: string;
}
