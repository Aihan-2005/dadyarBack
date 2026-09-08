import type {
  CreateFAQInput,
  ListFAQOptions,
} from "../interfaces/faq.interface";
import { FAQRepository } from "../repositories/faq.repository";

export class FAQService {
  constructor(private readonly repo: FAQRepository = new FAQRepository()) {}

  public createFAQ(input: CreateFAQInput) {
    return this.repo.create(input);
  }

  public listFAQ(options: ListFAQOptions) {
    return this.repo.listFAQ(options);
  }

  public deleteFAQ(id: string) {
    return this.repo.delete(id);
  }
}
