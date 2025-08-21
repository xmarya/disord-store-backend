import NodeCache from 'node-cache';
import { CACHE_TTL } from '@config/cache.config';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ 
      stdTTL: CACHE_TTL.DEFAULT,
      checkperiod: CACHE_TTL.DEFAULT * 0.2,
      useClones: false
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  del(keys: string | string[]): number {
    return this.cache.del(keys);
  }

  flush(): void {
    this.cache.flushAll();
  }
}

export default new CacheService();