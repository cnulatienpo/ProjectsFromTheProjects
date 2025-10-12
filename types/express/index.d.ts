declare module "express" {
    import type { Server } from "http";

    export type Request = any;
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
