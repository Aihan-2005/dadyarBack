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

  private buildListQuery(options: ListFAQOptions) {
    const search = this.escapeRegex(options.search ?? "");

    if (!search) {
      return {};
    }

    return {
      $or: [
        {
          question: {
            $regex: search,
            $options: "i",
          },
        },
        {
          answer: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    };
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
    const query = this.buildListQuery(options);

    const skip = (options.page - 1) * options.limit;

    return this.model
      .find(query)
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(options.limit)
      .lean<FAQ[]>()
      .exec();
  }

  public countFAQ(options: ListFAQOptions) {
    const query = this.buildListQuery(options);

    return this.model.countDocuments(query).exec();
  }
}
