// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonValue = string | number | boolean | any;

export interface JsonObject {
  [k: string]: JsonValue | JsonValue[] | JsonObject;
}
