import type {
  FAQ,
  CreateFAQInput,
  ListFAQOptions,
} from "../interfaces/faq.interface";
import { BaseRepository } from "./base.repository";
import { FAQModel } from "../models/faq.model";

export class FAQRepository extends BaseRepository<FAQ> {
  constructor() {
    super(FAQModel);
  }

  public create(data: CreateFAQInput) {
    return this.model.create(data);
  }

  public delete(id: string) {
    return this.model
      .findOneAndDelete({
        _id: this.toObjectId(id),
      })
      .lean()
      .exec();
  }

  public listFAQ(options: ListFAQOptions) {
    const search = this.escapeRegex(options.search || "");

    const query = {
      $or: [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ],
    };
    const skip = (options.page - 1) * options.limit;

    return this.model
      .find(search ? query : {})
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(options.limit)
      .lean<FAQ[]>()
      .exec();
  }
}
