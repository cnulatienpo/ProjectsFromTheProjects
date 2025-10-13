declare module "node:path" {
    const path: {
        resolve: (...paths: Array<string | URL>) => string;
        join: (...paths: string[]) => string;
        dirname: (path: string) => string;
    };
    export = path;
}

declare module "node:fs/promises" {
    export function readFile(path: string | URL, options?: any): Promise<any>;
    export function writeFile(path: string | URL, data: any, options?: any): Promise<void>;
    export function mkdir(path: string | URL, options?: { recursive?: boolean }): Promise<void>;
    export function copyFile(src: string | URL, dest: string | URL): Promise<void>;
    export function access(path: string | URL, mode?: number): Promise<void>;
    export function unlink(path: string | URL): Promise<void>;
    export function stat(path: string | URL): Promise<any>;
    export function readdir(path: string | URL, options?: { withFileTypes?: boolean }): Promise<any[]>;
}

declare module "node:fs" {
    export interface Stats {
        isFile(): boolean;
        isDirectory(): boolean;
    }
    export interface FSWatcher {
        close(): void;
        on(event: string, listener: (...args: any[]) => void): FSWatcher;
    }
    export const promises: typeof import("node:fs/promises");
    export function createReadStream(path: string | URL, options?: any): any;
}

declare module "node:net" {
    export interface AddressInfo {
        port: number;
        address: string;
        family: string;
    }
}

declare module "node:events" {
    class EventEmitter {
        on(event: string, listener: (...args: any[]) => void): this;
        once(event: string, listener: (...args: any[]) => void): this;
        off(event: string, listener: (...args: any[]) => void): this;
        emit(event: string, ...args: any[]): boolean;
    }
    export { EventEmitter };
}

declare module "node:stream" {
    export interface Stream {}
    export interface Readable extends Stream {
        pipe(destination: Writable, options?: any): Writable;
    }
    export interface Writable extends Stream {
        write(chunk: any, encoding?: string, cb?: (error?: Error | null) => void): boolean;
        end(chunk?: any, encoding?: string, cb?: () => void): void;
    }
    export interface Duplex extends Readable, Writable {}
    export interface DuplexOptions {
        allowHalfOpen?: boolean;
    }
}

declare module "node:http" {
    import { EventEmitter } from "node:events";
    export type Agent = any;
    export type ClientRequest = any;
    export interface ClientRequestArgs {}
    export interface OutgoingHttpHeaders extends Record<string, string | number | string[] | undefined> {}
    export interface ServerResponse extends EventEmitter {
        writeHead(statusCode: number, headers?: OutgoingHttpHeaders): this;
        end(data?: any): void;
    }
    export interface IncomingHttpHeaders extends Record<string, string | string[] | undefined> {}
    export interface IncomingMessage extends EventEmitter {
        headers: IncomingHttpHeaders;
        url?: string;
        method?: string;
    }
    export interface Server extends EventEmitter {
        listen(port: number, cb?: () => void): Server;
        close(cb?: (err?: Error) => void): void;
        address(): any;
    }
    export { IncomingMessage };
}

declare module "node:https" {
    export type ServerOptions = any;
    export type Agent = any;
    export type Server = any;
}

declare module "node:http2" {
    export type Http2SecureServer = any;
}

declare module "node:tls" {
    export interface SecureContextOptions {
        [key: string]: unknown;
    }
}

declare module "node:url" {
    export { URL } from "url";
}

declare module "node:zlib" {
    export interface ZlibOptions {
        [key: string]: unknown;
    }
}

declare module "url" {
    export class URL {
        constructor(input: string, base?: string | URL);
        toString(): string;
    }
}

declare module "node:module" {
    export function createRequire(filename: string): (id: string) => any;
}

declare module "http" {
    export interface Server {
        listen(port: number, cb?: () => void): Server;
        close(cb?: (err?: Error) => void): void;
        once(event: string, listener: (...args: any[]) => void): void;
        address(): any;
    }
}

interface SymbolConstructor {
    readonly asyncDispose: symbol;
}

declare namespace NodeJS {
    interface ProcessEnv {
        [key: string]: string | undefined;
    }
    interface Process {
        env: ProcessEnv;
        cwd(): string;
        exit(code?: number): void;
    }
    interface Timeout {}
    interface FSWatcher {}
    interface ReadableStream {}
    interface WritableStream {}
    interface ErrnoException extends Error {
        code?: string | number;
        errno?: number;
        syscall?: string;
    }
}

declare const process: NodeJS.Process & { exitCode?: number };
