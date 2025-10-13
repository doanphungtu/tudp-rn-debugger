export interface NetworkRequest {
    id: string;
    url: string;
    method: string;
    status?: number;
    duration?: number;
    requestBody?: string | null;
    responseBody?: string | null;
    startTime: number;
    endTime?: number;
}
