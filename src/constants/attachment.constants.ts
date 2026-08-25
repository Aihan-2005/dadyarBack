export const ATTACHMENT_MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const ATTACHMENT_EXTENSIONS = [
  "jpg",
  "png",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "zip",
  "rar",
] as const;

export const ATTACHMENT_MIME_TYPES = {
  jpg: ["image/jpeg"],

  png: ["image/png"],

  pdf: ["application/pdf"],

  doc: ["application/msword"],

  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  xls: ["application/vnd.ms-excel"],

  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],

  zip: ["application/zip", "application/x-zip-compressed"],

  rar: ["application/vnd.rar", "application/x-rar-compressed"],
} as const;

export type AttachmentExtension = (typeof ATTACHMENT_EXTENSIONS)[number];
