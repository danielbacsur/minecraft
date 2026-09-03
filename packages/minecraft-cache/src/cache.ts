import { Redis } from "@upstash/redis";

import { sha256 } from "./crypto";

class LRUCache<V> {
  private map = new Map<string, { value: V; exp: number }>();

  // prettier-ignore
  constructor(private capacity: number, private ttl: number) {}

  get(key: string) {
    const item = this.map.get(key);

    if (!item) return;

    if (Date.now() > item.exp) {
      this.map.delete(key);
      return;
    }

    this.map.delete(key);
    this.map.set(key, item);

    return item.value;
  }

  set(key: string, value: V) {
    this.map.delete(key);

    if (this.map.size >= this.capacity) {
      this.map.delete(this.map.keys().next().value!);
    }

    this.map.set(key, { value, exp: Date.now() + this.ttl });
  }
}

class RedisCache<V> {
  private redis = Redis.fromEnv();

  // prettier-ignore
  constructor(private ttl: number) {}

  async get(key: string) {
    return (await this.redis.get<V>(key)) ?? undefined;
  }

  async set(key: string, value: V) {
    await this.redis.set(key, value, { px: this.ttl });
  }
}

export class Cache<V> {
  private lru: LRUCache<V>;
  private redis: RedisCache<V>;

  constructor(
    private prefix: string,
    capacity = 1000,
    lru = 60 * 60 * 1000,
    redis = 730 * 60 * 60 * 1000,
  ) {
    this.lru = new LRUCache<V>(capacity, lru);
    this.redis = new RedisCache<V>(redis);
  }

  async get(key: string) {
    const $ = `${this.prefix}:${await sha256(key)}`;

    const lru = this.lru.get($);
    if (lru !== undefined) return lru;

    const redis = await this.redis.get($);
    if (redis !== undefined) this.lru.set($, redis);

    return redis;
  }

  set(key: string, value: V) {
    void (async () => {
      const $ = `${this.prefix}:${await sha256(key)}`;

      this.lru.set($, value);
      await this.redis.set($, value);
    })().catch(() => {});
  }
}
