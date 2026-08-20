import { createClient } from "redis";

import { env } from "./env";

export type RedisClient = ReturnType<typeof createClient>;

export class RedisDatabase {
  private readonly client: RedisClient;

  private connectionPromise: Promise<void> | null = null;

  constructor(url: string = env.REDIS_URL) {
    this.client = createClient({
      url,
    });

    this.client.on("error", (error) => {
      console.error(
        "[Redis] Client error:",
        error instanceof Error ? error.message : "Unknown Redis error",
      );
    });
  }

  public async connect(): Promise<void> {
    if (this.client.isReady) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.client
      .connect()
      .then(() => {
        console.info("[Redis] Connection established.");
      })
      .finally(() => {
        this.connectionPromise = null;
      });

    return this.connectionPromise;
  }

  public async getClient(): Promise<RedisClient> {
    await this.connect();

    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (!this.client.isOpen) {
      return;
    }

    await this.client.close();

    console.info("[Redis] Connection closed.");
  }
}
