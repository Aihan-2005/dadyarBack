import mongoose from "mongoose";

import {
  env,
} from "../config/env";

import {
  LAWYER_STATUSES,
} from "../constants/lawyer.constants";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  LawyerRecord,
} from "../interfaces/lawyer.interface";

import type {
  UserRecord,
} from "../interfaces/user.interface";

import {
  LawyerRepository,
} from "../repositories/lawyer.repository";

import {
  UserRepository,
} from "../repositories/user.repository";

import type {
  LawyerProfilePatchInput,
} from "../validators/lawyer.validator";


const LANGUAGE =
  env.LANGUAGE;


type RequiredDirectoryField = {
  key:
    string;

  label:
    string;
};


export class LawyerSelfDirectoryService {
  constructor(
    private readonly lawyerRepository =
      new LawyerRepository(),

    private readonly userRepository =
      new UserRepository(),
  ) {}


  private collectMissingBasicFields(
    input: {
      specialization:
        unknown;

      licenseNumber:
        unknown;

      phone:
        unknown;

      address:
        unknown;

      bio:
        unknown;
    },
  ): RequiredDirectoryField[] {
    const missingFields:
      RequiredDirectoryField[] = [];


    const requireText = (
      key:
        string,

      label:
        string,

      value:
        unknown,
    ) => {
      if (
        typeof value !==
          "string" ||
        !value.trim()
      ) {
        missingFields.push({
          key,

          label,
        });
      }
    };


    requireText(
      "specialization",

      "تخصص",

      input.specialization,
    );


    requireText(
      "licenseNumber",

      "شماره پروانه وکالت",

      input.licenseNumber,
    );


    requireText(
      "phone",

      "شماره تماس عمومی",

      input.phone,
    );


    requireText(
      "address",

      "آدرس دفتر",

      input.address,
    );


    requireText(
      "bio",

      "بیوگرافی",

      input.bio,
    );


    return missingFields;
  }


  private getMissingFieldsFromRecord(
    lawyer:
      LawyerRecord,
  ): RequiredDirectoryField[] {
    return this.collectMissingBasicFields({
      specialization:
        lawyer.specialization,

      licenseNumber:
        lawyer.licenseNumber,

      /*
       * شماره عمومی پروفایل وکیل.
       * User.phone مربوط به login است و اینجا استفاده نمی‌شود.
       */
      phone:
        lawyer.contactPhone,

      address:
        lawyer.address,

      bio:
        lawyer.bio,
    });
  }


  /*
   * برای PATCH فقط فیلد ارسال‌شده را با مقدار جدید جایگزین می‌کنیم.
   * بقیه‌ی اطلاعات از رکورد فعلی وکیل خوانده می‌شوند.
   *
   * بنابراین PATCH زبان‌ها هیچ اثری روی اطلاعات پایه ندارد.
   */
  private getMissingFieldsAfterPatch(
    lawyer:
      LawyerRecord,

    input:
      LawyerProfilePatchInput,
  ): RequiredDirectoryField[] {
    return this.collectMissingBasicFields({
      specialization:
        input.specialization !==
        undefined
          ? input.specialization
          : lawyer.specialization,

      licenseNumber:
        input.licenseNumber !==
        undefined
          ? input.licenseNumber
          : lawyer.licenseNumber,

      phone:
        input.phone !==
        undefined
          ? input.phone
          : lawyer.contactPhone,

      address:
        input.address !==
        undefined
          ? input.address
          : lawyer.address,

      bio:
        input.bio !==
        undefined
          ? input.bio
          : lawyer.bio,
    });
  }


  private buildState(
    lawyer:
      LawyerRecord,

    user:
      UserRecord,
  ) {
    const missingFields =
      this.getMissingFieldsFromRecord(
        lawyer,
      );


    let blockedReason:
      | "LAWYER_SUSPENDED"
      | "LAWYER_REJECTED"
      | "ACCOUNT_NOT_ACTIVE"
      | null =
      null;


    if (
      lawyer.status ===
      LAWYER_STATUSES.SUSPENDED
    ) {
      blockedReason =
        "LAWYER_SUSPENDED";
    } else if (
      lawyer.status ===
      LAWYER_STATUSES.REJECTED
    ) {
      blockedReason =
        "LAWYER_REJECTED";
    } else if (
      user.status !==
      "ACTIVE"
    ) {
      blockedReason =
        "ACCOUNT_NOT_ACTIVE";
    }


    const isVisible =
      lawyer.clientDirectory
        ?.isVisible ??
      false;


    const publishedAt =
      lawyer.clientDirectory
        ?.publishedAt
        ? new Date(
            lawyer.clientDirectory
              .publishedAt,
          ).toISOString()
        : null;


    return {
      isVisible,

      isFeatured:
        lawyer.clientDirectory
          ?.isFeatured ??
        false,

      displayOrder:
        lawyer.clientDirectory
          ?.displayOrder ??
        null,

      publishedAt,

      /*
       * فقط اطلاعات پایه شرط انتشار هستند.
       * education / experience / skills / languages
       * همگی اختیاری هستند.
       */
      profileComplete:
        missingFields.length ===
        0,

      canPublish:
        !isVisible &&
        missingFields.length ===
          0 &&
        blockedReason ===
          null,

      missingFields,

      blockedReason,
    };
  }


  private async requireLawyerAndUser(
    lawyerId:
      string,
  ) {
    const [
      lawyer,
      user,
    ] =
      await Promise.all([
        this.lawyerRepository
          .findById(
            lawyerId,
          ),

        this.userRepository
          .findById(
            lawyerId,
          ),
      ]);


    if (
      !lawyer ||
      !user
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "LAWYER_NOT_FOUND",
      );
    }


    return {
      lawyer,

      user,
    };
  }


  public async getState(
    lawyerId:
      string,
  ) {
    const {
      lawyer,
      user,
    } =
      await this.requireLawyerAndUser(
        lawyerId,
      );


    return this.buildState(
      lawyer,

      user,
    );
  }



  
  public async assertPublishedProfileCanBeUpdated(
    lawyerId:
      string,

    input:
      LawyerProfilePatchInput,
  ): Promise<void> {
    const {
      lawyer,
    } =
      await this.requireLawyerAndUser(
        lawyerId,
      );


    if (
      !lawyer.clientDirectory
        ?.isVisible
    ) {
      return;
    }


    const missingFields =
      this.getMissingFieldsAfterPatch(
        lawyer,

        input,
      );


    if (
      missingFields.length ===
      0
    ) {
      return;
    }


    throw new HttpException(
      409,

      `پروفایل منتشرشده باید اطلاعات پایه را کامل نگه دارد. ابتدا نمایش در بخش موکلین را غیرفعال کنید یا این موارد را تکمیل نگه دارید: ${missingFields
        .map(
          (
            item,
          ) =>
            item.label,
        )
        .join(
          "، ",
        )}`,

      "PUBLISHED_LAWYER_PROFILE_MUST_REMAIN_COMPLETE",
    );
  }


  public async setVisibility(
    lawyerId:
      string,

    isVisible:
      boolean,
  ) {
    const {
      lawyer,
      user,
    } =
      await this.requireLawyerAndUser(
        lawyerId,
      );


    const state =
      this.buildState(
        lawyer,

        user,
      );


    if (
      isVisible
    ) {
      if (
        state.blockedReason ===
        "LAWYER_SUSPENDED"
      ) {
        throw new HttpException(
          403,

          "حساب حرفه‌ای وکیل تعلیق شده و قابل انتشار نیست.",

          "LAWYER_SUSPENDED",
        );
      }


      if (
        state.blockedReason ===
        "LAWYER_REJECTED"
      ) {
        throw new HttpException(
          403,

          "حساب حرفه‌ای وکیل رد شده و قابل انتشار نیست.",

          "LAWYER_REJECTED",
        );
      }


      if (
        state.blockedReason ===
        "ACCOUNT_NOT_ACTIVE"
      ) {
        throw new HttpException(
          403,

          "حساب کاربری وکیل فعال نیست.",

          "LAWYER_ACCOUNT_NOT_ACTIVE",
        );
      }


      if (
        !state.profileComplete
      ) {
        throw new HttpException(
          409,

          `برای نمایش در بخش موکلین ابتدا اطلاعات پایه را کامل کنید: ${state.missingFields
            .map(
              (
                item,
              ) =>
                item.label,
            )
            .join(
              "، ",
            )}`,

          "LAWYER_PROFILE_INCOMPLETE_FOR_DIRECTORY",
        );
      }
    }


    const session =
      await mongoose.startSession();


    try {
      await session.withTransaction(
        async () => {
          const current =
            await this.lawyerRepository
              .findClientDirectoryStateById(
                lawyerId,

                session,
              );


          if (
            !current
          ) {
            throw new HttpException(
              404,

              MESSAGES.noUserWithId[
                LANGUAGE
              ],

              "LAWYER_NOT_FOUND",
            );
          }


          if (
            isVisible
          ) {
            if (
              current.status ===
                LAWYER_STATUSES.SUSPENDED ||
              current.status ===
                LAWYER_STATUSES.REJECTED
            ) {
              throw new HttpException(
                403,

                "این حساب وکیل در وضعیت قابل انتشار نیست.",

                "LAWYER_NOT_ELIGIBLE_FOR_SELF_PUBLISH",
              );
            }


            if (
              current.clientDirectory
                ?.isVisible
            ) {
              return;
            }


            const total =
              await this.lawyerRepository
                .countClientDirectoryPlacements(
                  session,
                );


            const updated =
              await this.lawyerRepository
                .updateClientDirectoryById(
                  lawyerId,

                  {
                    $set: {
                      /*
                       * برای حفظ رفتار فعلی Directory.
                       *
                       * licenseVerifiedAt دست‌نخورده باقی می‌ماند.
                       */
                      status:
                        LAWYER_STATUSES.ACTIVE,

                      "clientDirectory.isVisible":
                        true,

                      "clientDirectory.isFeatured":
                        false,

                      "clientDirectory.displayOrder":
                        total +
                        1,

                      "clientDirectory.publishedAt":
                        new Date(),
                    },
                  },

                  session,
                );


            if (
              !updated
            ) {
              throw new HttpException(
                404,

                MESSAGES.noUserWithId[
                  LANGUAGE
                ],

                "LAWYER_NOT_FOUND",
              );
            }


            return;
          }


          if (
            !current.clientDirectory
              ?.isVisible
          ) {
            return;
          }


          const total =
            await this.lawyerRepository
              .countClientDirectoryPlacements(
                session,
              );


          const rawOrder =
            current.clientDirectory
              .displayOrder ??
            total;


          const currentOrder =
            Math.min(
              Math.max(
                rawOrder,

                1,
              ),

              Math.max(
                total,

                1,
              ),
            );


          const updated =
            await this.lawyerRepository
              .updateClientDirectoryById(
                lawyerId,

                {
                  $set: {
                    "clientDirectory.isVisible":
                      false,

                    "clientDirectory.isFeatured":
                      false,

                    "clientDirectory.displayOrder":
                      null,

                    "clientDirectory.publishedAt":
                      null,
                  },
                },

                session,
              );


          if (
            !updated
          ) {
            throw new HttpException(
              404,

              MESSAGES.noUserWithId[
                LANGUAGE
              ],

              "LAWYER_NOT_FOUND",
            );
          }


          await this.lawyerRepository
            .shiftClientDirectoryForRemoval(
              currentOrder,

              session,
            );
        },
      );
    } finally {
      await session.endSession();
    }


    return this.getState(
      lawyerId,
    );
  }
}