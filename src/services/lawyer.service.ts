import {
  Types,
  type UpdateQuery,
} from "mongoose";

import {
  env,
} from "../config/env";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  toLawyerProfileDTO,
  toPublicLawyerDTO,
} from "../dtos/lawyer.dto";

import {
  toLawyerDirectoryDTO,
} from "../dtos/lawyerDirectory.dto";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  Lawyer,
} from "../interfaces/lawyer.interface";

import type {
  LawyerDirectoryListOptions,
} from "../interfaces/lawyerDirectory.interface";

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


export class LawyerService {
  constructor(
    private readonly repo =
      new LawyerRepository(),

    private readonly userRepo =
      new UserRepository(),
  ) {}


  private normalizeLicenseNumber(
    licenseNumber:
      string,
  ): string | undefined {
    return (
      licenseNumber.trim() ||
      undefined
    );
  }


  private sameLawyer(
    recordId:
      unknown,

    lawyerId:
      string,
  ): boolean {
    return String(
      recordId,
    ) === lawyerId;
  }


  private preserveSubdocumentId(
    id?:
      string,
  ):
    | Types.ObjectId
    | undefined {
    if (
      !id ||
      !Types.ObjectId.isValid(
        id,
      )
    ) {
      return undefined;
    }


    return new Types.ObjectId(
      id,
    );
  }


  public async findById(
    lawyerId:
      string,
  ) {
    const [
      lawyer,
      user,
    ] =
      await Promise.all([
        this.repo.findById(
          lawyerId,
        ),

        this.userRepo.findById(
          lawyerId,
        ),
      ]);


    if (
      !lawyer ||
      !user
    ) {
      return null;
    }


    return toPublicLawyerDTO(
      lawyer,

      user,
    );
  }


  public async findProfileById(
    lawyerId:
      string,
  ) {
    const [
      lawyer,
      user,
    ] =
      await Promise.all([
        this.repo.findById(
          lawyerId,
        ),

        this.userRepo.findById(
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


    return toLawyerProfileDTO(
      lawyer,

      user,
    );
  }


  public async listClientDirectory(
    options:
      LawyerDirectoryListOptions,
  ) {
    const result =
      await this.repo
        .findClientDirectory(
          options,
        );


    return {
      items:
        result.items.map(
          (
            lawyer,
          ) =>
            toLawyerDirectoryDTO(
              lawyer,

              lawyer.user,
            ),
        ),

      pagination: {
        page:
          options.page,

        limit:
          options.limit,

        total:
          result.total,

        totalPages:
          Math.ceil(
            result.total /
              options.limit,
          ),
      },
    };
  }


  public async getClientDirectoryLawyer(
    lawyerId:
      string,
  ) {
    const lawyer =
      await this.repo
        .findClientDirectoryById(
          lawyerId,
        );


    if (
      !lawyer
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "CLIENT_DIRECTORY_LAWYER_NOT_FOUND",
      );
    }


    return toLawyerDirectoryDTO(
      lawyer,

      lawyer.user,
    );
  }


  public async updateProfile(
    lawyerId:
      string,

    input:
      LawyerProfilePatchInput,
  ) {
    const [
      current,
      currentUser,
    ] =
      await Promise.all([
        this.repo.findById(
          lawyerId,
        ),

        this.userRepo.findById(
          lawyerId,
        ),
      ]);


    if (
      !current ||
      !currentUser
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "LAWYER_NOT_FOUND",
      );
    }


    const setFields:
      Record<
        string,
        unknown
      > = {};


    const unsetFields:
      Record<
        string,
        1
      > = {};


    /*
     * اطلاعات پایه
     */
    if (
      input.specialization !==
      undefined
    ) {
      setFields.specialization =
        input.specialization;
    }


    if (
      input.yearsOfExperience !==
      undefined
    ) {
      setFields.yearsOfExperience =
        input.yearsOfExperience;
    }


    
    if (
      input.phone !==
      undefined
    ) {
      if (
        input.phone ===
          null ||
        input.phone.trim() ===
          ""
      ) {
        unsetFields.contactPhone =
          1;
      } else {
        setFields.contactPhone =
          input.phone.trim();
      }
    }


    if (
      input.website !==
      undefined
    ) {
      if (
        input.website
      ) {
        setFields.website =
          input.website;
      } else {
        unsetFields.website =
          1;
      }
    }


    if (
      input.address !==
      undefined
    ) {
      setFields.address =
        input.address;
    }


    if (
      input.bio !==
      undefined
    ) {
      setFields.bio =
        input.bio;
    }


    
    if (
      input.education !==
      undefined
    ) {
      setFields.education =
        input.education.map(
          (
            item,
          ) => {
            const _id =
              this.preserveSubdocumentId(
                item.id,
              );


            return {
              ...(
                _id
                  ? {
                      _id,
                    }
                  : {}
              ),

              degree:
                item.degree,

              field:
                item.field,

              university:
                item.university,

              year:
                item.year,
            };
          },
        );
    }


  
    
    if (
      input.experience !==
      undefined
    ) {
      setFields.experience =
        input.experience.map(
          (
            item,
          ) => {
            const _id =
              this.preserveSubdocumentId(
                item.id,
              );


            return {
              ...(
                _id
                  ? {
                      _id,
                    }
                  : {}
              ),

              title:
                item.title,

              company:
                item.company,

              startYear:
                item.startYear,

              endYear:
                item.endYear,

              description:
                item.description ??
                "",
            };
          },
        );
    }


   
    
    if (
      input.skills !==
      undefined
    ) {
      setFields.skills =
        input.skills.map(
          (
            item,
          ) => {
            const _id =
              this.preserveSubdocumentId(
                item.id,
              );


            return {
              ...(
                _id
                  ? {
                      _id,
                    }
                  : {}
              ),

              name:
                item.name,

              level:
                item.level,
            };
          },
        );
    }


  
    
    if (
      input.languages !==
      undefined
    ) {
      setFields.languages =
        input.languages;
    }


    /*
     * شماره پروانه همچنان unique است،
     * چون هویت حرفه‌ای وکیل است.
     */
    if (
      input.licenseNumber !==
      undefined
    ) {
      const normalizedLicense =
        this.normalizeLicenseNumber(
          input.licenseNumber,
        );


      const currentLicense =
        this.normalizeLicenseNumber(
          current.licenseNumber ??
            "",
        );


      const licenseChanged =
        normalizedLicense !==
        currentLicense;


      if (
        normalizedLicense &&
        licenseChanged
      ) {
        const licenseOwner =
          await this.repo
            .findByLicenseNumber(
              normalizedLicense,
            );


        if (
          licenseOwner &&
          !this.sameLawyer(
            licenseOwner._id,

            lawyerId,
          )
        ) {
          throw new HttpException(
            409,

            MESSAGES.barExsist[
              LANGUAGE
            ],

            "LICENSE_NUMBER_ALREADY_EXISTS",
          );
        }
      }


      if (
        normalizedLicense
      ) {
        setFields.licenseNumber =
          normalizedLicense;
      } else {
        unsetFields.licenseNumber =
          1;
      }


      if (
        licenseChanged
      ) {
        /*
         * بررسی مجوز قبلی با تغییر شماره پروانه
         * دیگر معتبر نیست.
         */
        setFields.licenseVerifiedAt =
          null;
      }
    }


    const update:
      UpdateQuery<Lawyer> = {};


    if (
      Object.keys(
        setFields,
      ).length >
      0
    ) {
      update.$set =
        setFields;
    }


    if (
      Object.keys(
        unsetFields,
      ).length >
      0
    ) {
      update.$unset =
        unsetFields;
    }


 
    
    const updated =
      await this.repo
        .updateProfileById(
          lawyerId,

          update,
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


    return toLawyerProfileDTO(
      updated,

      currentUser,
    );
  }
}
