/**
 * TypeScript declarations for Claude's storage API
 */

interface StorageGetResult {
  key: string;
  value: string;
  shared: boolean;
}

interface StorageSetResult {
  key: string;
  value: string;
  shared: boolean;
}

interface StorageDeleteResult {
  key: string;
  deleted: boolean;
  shared: boolean;
}

interface StorageListResult {
  keys: string[];
  prefix?: string;
  shared: boolean;
}

interface WindowStorage {
  get(key: string, shared?: boolean): Promise<StorageGetResult | null>;
  set(key: string, value: string, shared?: boolean): Promise<StorageSetResult | null>;
  delete(key: string, shared?: boolean): Promise<StorageDeleteResult | null>;
  list(prefix?: string, shared?: boolean): Promise<StorageListResult | null>;
}

interface Window {
  storage: WindowStorage;
}

declare global {
  interface Window {
    storage: WindowStorage;
  }
}
