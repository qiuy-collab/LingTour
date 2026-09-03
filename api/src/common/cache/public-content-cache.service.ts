import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class PublicContentCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(PublicContentCacheService.name);
  private readonly redis: Redis | null;
  private readonly namespace = 'lingtour:public:v1';
  private generation: string | null = null;

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>('REDIS_URL')?.trim();
    this.redis = redisUrl
      ? new Redis(redisUrl, {
          connectTimeout: 1000,
          enableOfflineQueue: false,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        })
      : null;

    this.redis?.on('error', (error) => {
      this.logger.warn(`Public cache unavailable: ${error.message}`);
    });
  }

  async getOrSet<T>(
    requestKey: string,
    ttlSeconds: number,
    load: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(requestKey);
    if (cached !== null) return cached;

    const value = await load();
    await this.set(requestKey, value, ttlSeconds);
    return value;
  }

  async get<T>(requestKey: string): Promise<T | null> {
    const redis = await this.connectedRedis();
    if (!redis) return null;

    try {
      const generation = await this.getGeneration(redis);
      const value = await redis.get(this.key(generation, requestKey));
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logger.warn(`Public cache read failed: ${this.message(error)}`);
      return null;
    }
  }

  async set(requestKey: string, value: unknown, ttlSeconds: number): Promise<void> {
    const redis = await this.connectedRedis();
    if (!redis) return;

    try {
      const generation = await this.getGeneration(redis);
      await redis.set(
        this.key(generation, requestKey),
        JSON.stringify(value),
        'EX',
        ttlSeconds,
      );
    } catch (error) {
      this.logger.warn(`Public cache write failed: ${this.message(error)}`);
    }
  }

  async invalidateAll(): Promise<void> {
    const redis = await this.connectedRedis();
    if (!redis) return;

    try {
      this.generation = String(await redis.incr(`${this.namespace}:generation`));
    } catch (error) {
      this.logger.warn(`Public cache invalidation failed: ${this.message(error)}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit().catch(() => undefined);
  }

  private async connectedRedis(): Promise<Redis | null> {
    if (!this.redis) return null;
    try {
      if (this.redis.status === 'wait') await this.redis.connect();
      return this.redis.status === 'ready' ? this.redis : null;
    } catch (error) {
      this.logger.warn(`Public cache connection failed: ${this.message(error)}`);
      return null;
    }
  }

  private async getGeneration(redis: Redis): Promise<string> {
    if (this.generation) return this.generation;
    const key = `${this.namespace}:generation`;
    const current = await redis.get(key);
    this.generation = current ?? '1';
    if (!current) await redis.set(key, this.generation, 'NX');
    return this.generation;
  }

  private key(generation: string, requestKey: string): string {
    return `${this.namespace}:${generation}:${requestKey}`;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
