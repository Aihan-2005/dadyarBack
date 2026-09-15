import mongoose, {
  Document,
  Schema,
} from "mongoose";

import type {
  IConsultationBooking,
} from "../interfaces/consultationBooking.interface";

import {
  ConsultationBookingStatus,
  ConsultationType,
} from "../constants/consultationBooking.constants";


export interface ConsultationBookingDocument
  extends IConsultationBooking,
    Document {}


const ConsultationBookingSchema =
  new Schema<ConsultationBookingDocument>(
    {
      clientId: {
        type:
          String,

        required:
          true,

        index:
          true,
      },

      lawyerId: {
        type:
          String,

        required:
          true,

        index:
          true,
      },

     
      
      availabilityId: {
        type:
          String,

        default:
          null,

        index:
          true,
      },

      type: {
        type:
          String,

        enum:
          Object.values(
            ConsultationType,
          ),

        required:
          true,
      },

    
      
      startsAt: {
        type:
          Date,

        default:
          null,

        index:
          true,
      },

      endsAt: {
        type:
          Date,

        default:
          null,
      },

  
      
      date: {
        type:
          String,

        required:
          true,
      },

      time: {
        type:
          String,

        required:
          true,
      },

      description: {
        type:
          String,

        default:
          "",
      },

      status: {
        type:
          String,

        enum:
          Object.values(
            ConsultationBookingStatus,
          ),

        default:
          ConsultationBookingStatus.PENDING,
      },
    },

    {
      timestamps:
        true,
    },
  );


ConsultationBookingSchema.index({
  lawyerId:
    1,

  startsAt:
    1,
});


ConsultationBookingSchema.index({
  clientId:
    1,

  createdAt:
    -1,
});


export const ConsultationBooking =
  mongoose.model<ConsultationBookingDocument>(
    "ConsultationBooking",

    ConsultationBookingSchema,
  );