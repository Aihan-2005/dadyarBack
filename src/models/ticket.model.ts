import { model, Schema } from "mongoose";

import { TICKET_STATUSES, TICKET_TYPES } from "../constants/ticket.constants";

export const TicketSchema = new Schema(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,

      ref: "Lawyer",

      required: true,

      immutable: true,

      index: true,
    },

    title: {
      type: String,

      required: true,

      trim: true,

      maxlength: 200,
    },

    type: {
      type: String,

      enum: TICKET_TYPES,
    },

    status: {
      type: String,

      enum: TICKET_STATUSES,

      required: true,

      default: "OPEN",
    },
  },
  {
    timestamps: true,
  },
);

// ---------------- Indexes ----------------

TicketSchema.index({
  lawyerId: 1,
  status: 1,
  createdAt: -1,
});

TicketSchema.index({
  status: 1,
  createdAt: -1,
});

export const TicketModel = model("Ticket", TicketSchema);
