declare module "cookie-parser" {
    import type { RequestHandler } from "express";

    interface CookieParser {
        (): RequestHandler;
        JSONCookies<T>(obj: T): T;
        signedCookie<T>(value: T): T;
    }

    const cookieParser: CookieParser;
    export default cookieParser;
}
