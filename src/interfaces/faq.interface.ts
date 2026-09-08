import { z } from "zod";
import { InferSchemaType } from "mongoose";
import { FAQSchema } from "../models/faq.model";
import { CreateFAQSchema, ListFAQSchema } from "../validators/faq.validator";

export type FAQ = InferSchemaType<typeof FAQSchema> & {
  createdAt: Date;

  updatedAt: Date;
};

export type CreateFAQInput = z.infer<typeof CreateFAQSchema>;

export type ListFAQOptions = z.infer<typeof ListFAQSchema>;
