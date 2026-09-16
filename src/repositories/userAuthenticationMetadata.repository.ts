import {
  Types,

  type ClientSession,
} from "mongoose";

import type {
  UserRecord,
} from "../interfaces/user.interface";

import {
  UserModel,
} from "../models/user.model";


export class UserAuthenticationMetadataRepository {
  public recordOtpLogin(
    userId:
      string,

    input: {
      lastLoginAt:
        Date;

      phoneVerifiedAt?:
        Date;
    },

    session?:
      ClientSession,
  ) {
    const setFields: {
      lastLoginAt:
        Date;

      phoneVerifiedAt?:
        Date;
    } = {
      lastLoginAt:
        input.lastLoginAt,
    };


    if (
      input.phoneVerifiedAt
    ) {
      setFields.phoneVerifiedAt =
        input.phoneVerifiedAt;
    }


    return UserModel
      .findOneAndUpdate(
        {
          _id:
            new Types.ObjectId(
              userId,
            ),
        },

        {
          $set:
            setFields,
        },

        {
          new:
            true,

          runValidators:
            true,

          session,
        },
      )
      .lean<UserRecord>()
      .exec();
  }
}