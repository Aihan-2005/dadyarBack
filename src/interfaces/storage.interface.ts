export type SaveFileInput = {
  storageKey: string;

  buffer: Buffer;

  mimeType: string;
};

export type GetDownloadUrlInput = {
  storageKey: string;

  expiresInSeconds?: number;
};
