import { model, Schema } from "mongoose";

import { TICKET_MESSAGE_SENDERS } from "../constants/ticket.constants";

export const TicketMessageSchema = new Schema(
  {
    ticketId: {
      type: Schema.Types.ObjectId,

      ref: "Ticket",

      required: true,

      immutable: true,

      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,

      required: true,

      immutable: true,
    },

    senderType: {
      type: String,

      enum: TICKET_MESSAGE_SENDERS,

      required: true,

      immutable: true,
    },

    message: {
      type: String,

      required: true,

      trim: true,

      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  },
);

// ---------------- Indexes ----------------

TicketMessageSchema.index({
  ticketId: 1,
  createdAt: 1,
});

export const TicketMessageModel = model("TicketMessage", TicketMessageSchema);
