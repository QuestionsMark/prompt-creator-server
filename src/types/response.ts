export type Method = 'POST' | 'DELETE' | 'PATCH' | 'PUT' | 'GET';

export interface ServerSuccessfullResponse<T> {
    results: T;
    count?: number;
}
export interface ServerErrorResponse {
    message: string;
    problems?: string[];
}
export type ServerResponse<T> = ServerSuccessfullResponse<T> | ServerErrorResponse;

export interface ClientResponseOK<T> {
    status: true;
    results: T;
    count?: number;
}
export interface ClientResponseError {
    status: false;
    message: string;
    problems?: string[];
}
export type ClientResponse<T> = ClientResponseOK<T> | ClientResponseError;
