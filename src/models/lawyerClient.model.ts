import { model, Schema } from "mongoose";

const SENSITIVE_CLIENT_FIELDS = ["personalPassword"] as const;

function removeSensitiveClientFields(
  _document: unknown,
  returnedObject: unknown,
): unknown {
  if (!returnedObject || typeof returnedObject !== "object") {
    return returnedObject;
  }

  const object = returnedObject as Record<string, unknown>;

  for (const field of SENSITIVE_CLIENT_FIELDS) {
    delete object[field];
  }

  return returnedObject;
}

export const LawyerClientSchema = new Schema(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,

      ref: "Lawyer",

      required: true,

      immutable: true,

      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,

      ref: "User",
    },

    fullName: {
      type: String,

      required: true,

      trim: true,

      maxlength: 200,
    },

    phone: {
      type: String,

      required: true,

      trim: true,

      match: /^09\d{9}$/,
    },

    nationalId: {
      type: String,

      trim: true,

      match: /^\d{10,11}$/,

      maxlength: 11,
    },

    homeNumber: {
      type: String,

      trim: true,

      maxlength: 30,
    },

    birthday: {
      type: Date,
    },

    homeAddress: {
      type: String,

      trim: true,

      maxlength: 500,
    },

    represent: {
      type: String,

      trim: true,

      maxlength: 200,
    },

    description: {
      type: String,

      trim: true,

      maxlength: 1000,
    },

    personalPassword: {
      type: String,

      maxlength: 200,

      select: false,
    },
  },

  {
    timestamps: true,

    toJSON: {
      transform: removeSensitiveClientFields,
    },

    toObject: {
      transform: removeSensitiveClientFields,
    },
  },
);

LawyerClientSchema.index(
  {
    lawyerId: 1,

    phone: 1,
  },
  {
    unique: true,
  },
);

LawyerClientSchema.index(
  {
    lawyerId: 1,

    nationalId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      nationalId: {
        $type: "string",
      },
    },
  },
);

LawyerClientSchema.index({
  lawyerId: 1,

  fullName: 1,
});

LawyerClientSchema.index(
  {
    userId: 1,
  },
  {
    partialFilterExpression: {
      userId: {
        $type: "objectId",
      },
    },
  },
);

export const LawyerClientModel = model(
  "LawyerClient",

  LawyerClientSchema,

  "lawyerclients",
);

export default LawyerClientModel;
