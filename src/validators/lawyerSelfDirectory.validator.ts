import {
  z,
} from "zod";


export const LawyerSelfDirectoryVisibilitySchema =
  z
    .object({
      isVisible:
        z.boolean(),
    })
    .strict();


export type LawyerSelfDirectoryVisibilityInput =
  z.output<
    typeof LawyerSelfDirectoryVisibilitySchema
  >;