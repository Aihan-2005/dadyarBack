import { Model, Types } from "mongoose";
import { MESSAGES } from "../constants/messages.constants";
import { env } from "../config/env";
const LANGUAGE = env.LANGUAGE;

export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  protected toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (!Types.ObjectId.isValid(id))
      throw new Error(MESSAGES.notValidId[LANGUAGE]);

    return new Types.ObjectId(id);
  }
}
