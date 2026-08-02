import { model, Schema } from "mongoose";

import type { Client } from "../interfaces/client.interface";

export const ClientSchema = new Schema<Client>(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,

      ref: "Lawyer",

      required: true,

      immutable: true,

      index: true,
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

      match: /^\d{10}$/,

      maxlength: 10,
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
  },
  {
    timestamps: true,

    versionKey: false,
  },
);

ClientSchema.index(
  {
    lawyerId: 1,

    phone: 1,
  },
  {
    unique: true,
  },
);

ClientSchema.index(
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

ClientSchema.index({
  lawyerId: 1,

  fullName: 1,
});

const ClientModel = model<Client>("Client", ClientSchema);

export default ClientModel;
