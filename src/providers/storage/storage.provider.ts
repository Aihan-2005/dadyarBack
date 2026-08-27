import type {
  GetDownloadUrlInput,
  SaveFileInput,
} from "../../interfaces/storage.interface";

export interface StorageProvider {
  save(input: SaveFileInput): Promise<void>;

  delete(storageKey: string): Promise<void>;

  getDownloadUrl(input: GetDownloadUrlInput): Promise<string>;
}
