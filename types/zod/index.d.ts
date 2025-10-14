declare namespace z {
  type infer<T> = any;
  type ZodIssue = {
    path: Array<string | number>;
    message: string;
  };
}

declare const z: any;

export type ZodIssue = z.ZodIssue;
export type infer<T> = any;
export { z };
export default z;
