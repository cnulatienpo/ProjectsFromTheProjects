export interface UserConfig {
  base?: string;
  plugins?: unknown[];
  resolve?: {
    alias?: Record<string, string>;
  };
  build?: Record<string, unknown>;
}

export function defineConfig(config: UserConfig): UserConfig;
