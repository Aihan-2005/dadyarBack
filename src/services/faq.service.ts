import { env } from "../config/env";
import { MESSAGES } from "../constants/messages.constants";
import { HttpException } from "../exceptions/httpException";
import type {
  CreateFAQInput,
  ListFAQOptions,
} from "../interfaces/faq.interface";
import { FAQRepository } from "../repositories/faq.repository";

const LANGUAGE = env.LANGUAGE;

export class FAQService {
  constructor(private readonly repo: FAQRepository = new FAQRepository()) {}

  public createFAQ(input: CreateFAQInput) {
    return this.repo.create(input);
  }

  public async listFAQ(options: ListFAQOptions) {
    const [items, total] = await Promise.all([
      this.repo.listFAQ(options),
      this.repo.countFAQ(options),
    ]);

    return {
      items,

      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  public async deleteFAQ(id: string) {
    const faq = await this.repo.delete(id);

    if (!faq) {
      throw new HttpException(
        404,
        MESSAGES.faqNotFound[LANGUAGE],
        "FAQ_NOT_FOUND",
      );
    }

    return faq;
  }
}
