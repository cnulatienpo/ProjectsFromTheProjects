declare module "node:path" {
    const path: {
        resolve: (...paths: string[]) => string;
        join: (...paths: string[]) => string;
    };
    export = path;
}

declare module "node:fs/promises" {
    export function readFile(path: string, encoding: string): Promise<string>;
    export function writeFile(path: string, data: string, encoding?: string): Promise<void>;
    export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    export function copyFile(src: string, dest: string): Promise<void>;
    export function access(path: string): Promise<void>;
}

declare module "node:fs" {
    export function createReadStream(path: string): any;
}

declare module "node:net" {
    export interface AddressInfo {
        port: number;
        address: string;
        family: string;
    }
}

declare module "http" {
    export interface Server {
        listen(port: number, cb?: () => void): Server;
        close(cb?: (err?: Error) => void): void;
        once(event: string, listener: (...args: any[]) => void): void;
        address(): any;
    }
}

declare module "node:module" {
    export function createRequire(filename: string): (id: string) => any;
}

declare const process: {
    cwd(): string;
    exitCode?: number;
};
