import type {
  InferSchemaType,
  Types,
} from "mongoose";

import type {
  z,
} from "zod";

import {
  ClientPetitionSchema,
} from "../models/clientPetition.model";

import {
  ClientPetitionListQuerySchema,
  CreateClientPetitionSchema,
  UpdateClientPetitionSchema,
} from "../validators/clientPetition.validator";


export type ClientPetition =
  InferSchemaType<
    typeof ClientPetitionSchema
  >;


export type ClientPetitionRecord =
  ClientPetition & {
    _id:
      Types.ObjectId;

    createdAt:
      Date;

    updatedAt:
      Date;
  };


export type CreateClientPetitionInput =
  z.output<
    typeof CreateClientPetitionSchema
  >;


export type UpdateClientPetitionInput =
  z.output<
    typeof UpdateClientPetitionSchema
  >;


export type ClientPetitionListOptions =
  z.output<
    typeof ClientPetitionListQuerySchema
  >;