declare module "@playwright/test" {
    export interface APIResponse {
        ok(): boolean;
        json<T = any>(): Promise<T>;
        headersArray(): Array<{ name: string; value: string }>;
    }

    export interface APIRequestContext {
        get(url: string, options?: Record<string, any>): Promise<APIResponse>;
        post(url: string, options?: Record<string, any>): Promise<APIResponse>;
    }

    export interface TestInfo {}

    export type TestFunction = (args: { request: APIRequestContext }) => unknown | Promise<unknown>;
    export type HookFunction = (fn: () => unknown | Promise<unknown>) => void;

    export interface TestDescribe {
        (name: string, fn: () => void): void;
        serial: TestDescribe;
        parallel: TestDescribe;
        only: TestDescribe;
        skip: TestDescribe;
    }

    export interface TestAPI {
        (name: string, fn: TestFunction): void;
        describe: TestDescribe;
        beforeAll: HookFunction;
        afterAll: HookFunction;
        beforeEach: HookFunction;
        afterEach: HookFunction;
        step(name: string, fn: () => unknown | Promise<unknown>): Promise<void>;
    }

    export const test: TestAPI;
    export const expect: {
        (actual: unknown): any;
        toBeTruthy(value: unknown): asserts value;
    } & Record<string, any>;
    export function defineConfig<T extends Record<string, any>>(config: T): T;
}
