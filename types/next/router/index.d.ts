export interface NextRouter {
  pathname: string;
  query: Record<string, string | string[]>;
  isReady: boolean;
  push(url: string): Promise<void> | void;
  replace(url: string): Promise<void> | void;
  back(): void;
}

export function useRouter(): NextRouter;
