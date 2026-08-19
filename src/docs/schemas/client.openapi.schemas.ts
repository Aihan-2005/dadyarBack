import {
  z,
} from "zod";

import {
  openApiRegistry,
} from "../openapi.registry";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";
 

export const ClientResponseSchema =
  openApiRegistry.register(
    "ClientResponse",

    z.object({
      _id:
        ObjectIdResponseSchema,

      lawyerId:
        ObjectIdResponseSchema,

      fullName:
        z.string(),

      phone:
        z.string(),

      nationalId:
        z
          .string()
          .optional(),

     
      homeNumber:
        z
          .string()
          .optional(),

      birthday:
        DateTimeResponseSchema
          .optional(),

      homeAddress:
        z
          .string()
          .optional(),

      represent:
        z
          .string()
          .optional(),

      description:
        z
          .string()
          .optional(),

      createdAt:
        DateTimeResponseSchema,

      updatedAt:
        DateTimeResponseSchema,
    }),
  );

 

export const ClientSuccessSchema =
  openApiRegistry.register(
    "ClientSuccess",

    z.object({
      success:
        z.literal(
          true,
        ),

      data:
        ClientResponseSchema,
    }),
  );

 

export const ClientLookupSuccessSchema =
  openApiRegistry.register(
    "ClientLookupSuccess",

    z.object({
      success:
        z.literal(
          true,
        ),

      data:
        ClientResponseSchema
          .nullable(),
    }),
  );

 

export const ClientListSuccessSchema =
  openApiRegistry.register(
    "ClientListSuccess",

    z.object({
      success:
        z.literal(
          true,
        ),

      data:
        z.array(
          ClientResponseSchema,
        ),

      pagination:
        PaginationSchema,
    }),
  );

export {
  ApiErrorSchema,
};