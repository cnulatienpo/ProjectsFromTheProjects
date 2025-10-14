declare interface ImportMetaEnv {
  readonly BASE_URL: string;
  [key: string]: unknown;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob<T = unknown>(pattern: string, options?: { eager?: boolean }): Record<string, T>;
}

declare module "vite/client" {
  const value: Record<string, unknown>;
  export default value;
}
