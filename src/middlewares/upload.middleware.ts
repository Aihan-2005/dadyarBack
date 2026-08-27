import multer from "multer";

import { ATTACHMENT_MAX_SIZE } from "../constants/attachment.constants";

const storage = multer.memoryStorage();

export const uploadAttachment = multer({
  storage,

  limits: {
    fileSize: ATTACHMENT_MAX_SIZE,

    files: 1,
  },
}).single("attachment");
