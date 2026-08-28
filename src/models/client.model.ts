import {
  model,
  Schema,
} from "mongoose";

import type {
  Client,
} from "../interfaces/client.interface";

const SENSITIVE_CLIENT_FIELDS = [
  "personalPassword",

  "personalPasswordHash",
] as const;

function removeSensitiveClientFields(
  _document: unknown,
  returnedObject: unknown,
): unknown {
  if (
    !returnedObject ||
    typeof returnedObject !== "object"
  ) {
    return returnedObject;
  }

  const object =
    returnedObject as Record<
      string,
      unknown
    >;

  for (
    const field of
      SENSITIVE_CLIENT_FIELDS
  ) {
    delete object[field];
  }

  return returnedObject;
}

export const ClientSchema =
  new Schema<Client>(
    {
      lawyerId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "Lawyer",

        required:
          true,

        immutable:
          true,

        index:
          true,
      },

      fullName: {
        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength:
          200,
      },

      phone: {
        type:
          String,

        required:
          true,

        trim:
          true,

        match:
          /^09\d{9}$/,
      },

      nationalId: {
        type:
          String,

        trim:
          true,

        match:
          /^\d{10,11}$/,

        maxlength:
          11,
      },

      homeNumber: {
        type:
          String,

        trim:
          true,

        maxlength:
          30,
      },

      birthday: {
        type:
          Date,
      },

      homeAddress: {
        type:
          String,

        trim:
          true,

        maxlength:
          500,
      },

      represent: {
        type:
          String,

        trim:
          true,

        maxlength:
          200,
      },

      description: {
        type:
          String,

        trim:
          true,

        maxlength:
          1000,
      },

      personalPassword: {
        type:
          String,

        maxlength:
          200,

        select:
          false,
      },
    },

    {
      timestamps:
        true,

      versionKey:
        false,

      toJSON: {
        transform:
          removeSensitiveClientFields,
      },

      toObject: {
        transform:
          removeSensitiveClientFields,
      },
    },
  );

ClientSchema.index(
  {
    lawyerId:
      1,

    phone:
      1,
  },
  {
    unique:
      true,
  },
);

ClientSchema.index(
  {
    lawyerId:
      1,

    nationalId:
      1,
  },
  {
    unique:
      true,

    partialFilterExpression: {
      nationalId: {
        $type:
          "string",
      },
    },
  },
);

ClientSchema.index({
  lawyerId:
    1,

  fullName:
    1,
});

const ClientModel =
  model<Client>(
    "Client",
    ClientSchema,
  );

export default ClientModel;