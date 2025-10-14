import type { CSSProperties, FC, ReactNode } from "react";

export interface RouterProps {
  children?: ReactNode;
  basename?: string;
}

export const BrowserRouter: FC<RouterProps>;
export const HashRouter: FC<RouterProps>;
export const Routes: FC<{ children?: ReactNode }>;
export const Route: FC<{ path?: string; element?: ReactNode }>;
export const Link: FC<{
  to: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (...args: any[]) => void;
  replace?: boolean;
  state?: any;
}>;
export const NavLink: FC<{
  to: string;
  children?: ReactNode;
  className?: string | ((props: any) => string);
  style?: CSSProperties | ((props: any) => CSSProperties);
  end?: boolean;
}>;
export const Outlet: FC;
export const Navigate: FC<{ to: string; replace?: boolean; state?: any }>;

export interface RouteObject {
  path?: string;
  element?: ReactNode;
  children?: RouteObject[];
}

export function useNavigate(): (to: string, options?: any) => void;
export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T;
export function useLocation(): { pathname: string; search: string; hash: string; state?: any };
export function useRouteError(): unknown;
export function useSearchParams(): [URLSearchParams, (nextInit: URLSearchParams | string) => void];
export function createBrowserRouter(routes: RouteObject[]): any;
export function createHashRouter(routes: RouteObject[]): any;
export function RouterProvider(props: { router: any }): ReactNode;
