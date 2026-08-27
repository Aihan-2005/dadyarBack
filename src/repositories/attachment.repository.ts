import type { ClientSession } from "mongoose";

import type {
  Attachment,
  CreateAttachmentData,
} from "../interfaces/attachment.interface";

import { AttachmentModel } from "../models/attachment.model";

import { BaseRepository } from "./base.repository";

export class AttachmentRepository extends BaseRepository<Attachment> {
  constructor() {
    super(AttachmentModel);
  }

  public async create(data: CreateAttachmentData, session?: ClientSession) {
    if (!session) {
      return this.model.create(data);
    }

    const [attachment] = await this.model.create([data], {
      session,
    });

    return attachment;
  }

  public findById(attachmentId: string) {
    return this.model.findById(this.toObjectId(attachmentId)).lean().exec();
  }

  public deleteById(attachmentId: string) {
    return this.model
      .findByIdAndDelete(this.toObjectId(attachmentId))
      .lean()
      .exec();
  }
}
