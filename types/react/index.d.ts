declare namespace React {
  type ReactNode = any;
  type PropsWithChildren<P = any> = P & { children?: ReactNode };
  interface FC<P = any> {
    (props: PropsWithChildren<P>): ReactNode | null;
    displayName?: string;
  }
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  type MutableRefObject<T> = { current: T | null };
  type ChangeEvent<T = any> = { target: T };
  type JSXElementConstructor<P> = any;
  type HTMLAttributes<T> = any;
  type ButtonHTMLAttributes<T> = any;
  type TextareaHTMLAttributes<T> = any;
  type ComponentType<P = any> = (props: P) => ReactNode | null;
  type CSSProperties = Record<string, string | number | undefined>;
  type ErrorInfo = { componentStack: string };
  interface Context<T> {
    Provider: FC<{ value: T }>;
    Consumer: FC<{ children?: (value: T) => ReactNode }>;
  }
  class Component<P = any, S = any> {
    constructor(props: P);
    props: P;
    state: S;
    setState(partial: Partial<S> | ((prevState: S) => Partial<S>)): void;
    render(): ReactNode;
  }
  function createContext<T>(defaultValue: T): Context<T>;
  function useContext<T>(context: Context<T>): T;
  function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  function useLayoutEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  function useCallback<T extends (...args: any[]) => any>(fn: T, deps: readonly unknown[]): T;
  function useReducer<R extends (state: any, action: any) => any, I>(
    reducer: R,
    initialArg: I,
    init?: (arg: I) => any,
  ): [any, Dispatch<any>];
  function useRef<T>(initialValue: T | null): MutableRefObject<T>;
  function useId(): string;
  function forwardRef<T, P = any>(render: (props: PropsWithChildren<P>, ref: MutableRefObject<T> | null) => ReactNode): FC<P>;
  function memo<T extends (...args: any[]) => any>(component: T, comparator?: (prev: any, next: any) => boolean): T;
  function createElement(type: any, props?: any, ...children: any[]): any;
  function cloneElement(element: any, props?: any, ...children: any[]): any;
  const Fragment: FC<PropsWithChildren>;
  const StrictMode: FC<PropsWithChildren>;
  const Suspense: FC<{ fallback?: ReactNode }>;
  type JSX = any;
}

declare module "react" {
  export = React;
  export as namespace React;
  export type ReactNode = React.ReactNode;
  export type PropsWithChildren<P = any> = React.PropsWithChildren<P>;
  export type FC<P = any> = React.FC<P>;
  export type Dispatch<A> = React.Dispatch<A>;
  export type SetStateAction<S> = React.SetStateAction<S>;
  export type MutableRefObject<T> = React.MutableRefObject<T>;
  export type ChangeEvent<T = any> = React.ChangeEvent<T>;
  export type JSXElementConstructor<P> = React.JSXElementConstructor<P>;
  export type HTMLAttributes<T> = React.HTMLAttributes<T>;
  export type ButtonHTMLAttributes<T> = React.ButtonHTMLAttributes<T>;
  export type TextareaHTMLAttributes<T> = React.TextareaHTMLAttributes<T>;
  export type ComponentType<P = any> = React.ComponentType<P>;
  export type CSSProperties = React.CSSProperties;
  export type ErrorInfo = React.ErrorInfo;
  export const Fragment: typeof React.Fragment;
  export const StrictMode: typeof React.StrictMode;
  export const Suspense: typeof React.Suspense;
  export const Component: typeof React.Component;
  export const createContext: typeof React.createContext;
  export const useContext: typeof React.useContext;
  export const useState: typeof React.useState;
  export const useEffect: typeof React.useEffect;
  export const useLayoutEffect: typeof React.useLayoutEffect;
  export const useMemo: typeof React.useMemo;
  export const useCallback: typeof React.useCallback;
  export const useReducer: typeof React.useReducer;
  export const useRef: typeof React.useRef;
  export const useId: typeof React.useId;
  export const forwardRef: typeof React.forwardRef;
  export const memo: typeof React.memo;
  export const createElement: typeof React.createElement;
  export const cloneElement: typeof React.cloneElement;
  export default React;
}

declare module "react/jsx-runtime" {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module "react/jsx-dev-runtime" {
  export const Fragment: any;
  export function jsxDEV(type: any, props: any, key?: any, _isStatic?: boolean, _source?: any, _self?: any): any;
}

declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface IntrinsicAttributes {
    key?: string | number;
  }
}
