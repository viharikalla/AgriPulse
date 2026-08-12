interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private static store: Map<string, CacheItem<unknown>> = new Map();

  public static get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  public static set<T>(key: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  public static delete(key: string): void {
    this.store.delete(key);
  }

  public static clear(): void {
    this.store.clear();
  }
}
