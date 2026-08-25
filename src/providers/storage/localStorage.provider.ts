import { mkdir, unlink, writeFile } from "node:fs/promises";

import * as path from "node:path";

import { env } from "../../config/env";

import type { SaveFileInput } from "../../interfaces/storage.interface";

import type { StorageProvider } from "./storage.provider";

export class LocalStorageProvider implements StorageProvider {
  private readonly rootPath: string;

  constructor() {
    this.rootPath = path.resolve(env.STORAGE_ROOT);
  }

  private resolveStoragePath(storageKey: string): string {
    const targetPath = path.resolve(this.rootPath, storageKey);

    const relativePath = path.relative(this.rootPath, targetPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error("Invalid storage key");
    }

    return targetPath;
  }

  public async save(input: SaveFileInput): Promise<void> {
    const filePath = this.resolveStoragePath(input.storageKey);

    await mkdir(path.dirname(filePath), {
      recursive: true,
    });

    await writeFile(filePath, input.buffer, {
      flag: "wx",
    });
  }

  public async delete(storageKey: string): Promise<void> {
    const filePath = this.resolveStoragePath(storageKey);

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }

      throw error;
    }
  }
}
