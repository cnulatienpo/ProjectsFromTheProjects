declare module "express" {
    import type { Server } from "http";

    export interface Request {
        playerId?: string;
        cookies?: Record<string, string>;
        signedCookies?: Record<string, string>;
        body?: any;
        query?: any;
        params?: any;
        headers?: Record<string, unknown>;
        header?(name: string): string | undefined;
        get?(name: string): string | undefined;
        [key: string]: any;
    }
    export type Response = any;
    export type NextFunction = (...args: any[]) => any;
    export type RequestHandler = (req: Request, res: Response, next?: NextFunction) => any;

    export interface Router {
        (req: Request, res: Response, next?: NextFunction): any;
        use: (...handlers: any[]) => Router;
        get: (...handlers: any[]) => Router;
        post: (...handlers: any[]) => Router;
        put: (...handlers: any[]) => Router;
        delete: (...handlers: any[]) => Router;
    }

    export interface Express extends Router {
        listen: (...args: any[]) => Server;
    }

    interface ExpressNamespace {
        (): Express;
        Router(): Router;
        json(): RequestHandler;
        static(path: string): RequestHandler;
    }

    const express: ExpressNamespace;
    export default express;
}
