import type {
  ClientSession,
  UpdateQuery,
} from "mongoose";

import type {
  Case,
  CaseClientInput,
  Court,
  CreateCaseInput,
  FindCasesOptions,
  LawyerContact,
  OpposingParty,
  RelatedPerson,
} from "../interfaces/case.interface";

import {
  CaseModel,
} from "../models/case.model";

import {
  BaseRepository,
} from "./base.repository";

export class CaseRepository extends BaseRepository<Case> {
  constructor() {
    super(
      CaseModel
    );
  }

 
  private escapeRegex(
    value:
      string
  ): string {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
  }

  private normalizeDigits(
    value:
      string
  ): string {
    return value
      .replace(
        /[۰-۹]/g,
        (digit) =>
          String(
            "۰۱۲۳۴۵۶۷۸۹"
              .indexOf(
                digit
              )
          )
      )
      .replace(
        /[٠-٩]/g,
        (digit) =>
          String(
            "٠١٢٣٤٥٦٧٨٩"
              .indexOf(
                digit
              )
          )
      );
  }

  private buildSearchRegexes(
    search:
      string
  ): Array<{
    $regex: string;
    $options: "i";
  }> {
    const values =
      Array.from(
        new Set([
          search,
          this.normalizeDigits(
            search
          ),
        ])
      )
        .map((value) =>
          value.trim()
        )
        .filter(Boolean);

    return values.map(
      (value) => ({
        $regex:
          this.escapeRegex(
            value
          ),

        $options:
          "i",
      })
    );
  }

  private buildSubDocumentSet(
    path:
      string,

    data:
      Record<
        string,
        unknown
      >
  ): Record<
    string,
    unknown
  > {
    const updateData:
      Record<
        string,
        unknown
      > = {};

    for (
      const [
        key,
        value,
      ] of Object.entries(
        data
      )
    ) {
      if (
        value !==
        undefined
      ) {
        updateData[
          `${path}.$.${key}`
        ] = value;
      }
    }

    return updateData;
  }

  private buildNestedSet(
    path:
      string,

    data:
      Record<
        string,
        unknown
      >
  ): Record<
    string,
    unknown
  > {
    const updateData:
      Record<
        string,
        unknown
      > = {};

    for (
      const [
        key,
        value,
      ] of Object.entries(
        data
      )
    ) {
      if (
        value !==
        undefined
      ) {
        updateData[
          `${path}.${key}`
        ] = value;
      }
    }

    return updateData;
  }

  private buildSearchQuery(
    lawyerId:
      string,

    options:
      FindCasesOptions
  ): Record<
    string,
    unknown
  > {
    const query:
      Record<
        string,
        unknown
      > = {
        lawyerId:
          this.toObjectId(
            lawyerId
          ),
      };

    if (
      options.state
    ) {
      query.state =
        options.state;
    }

    const search =
      options.search
        ?.trim();

    if (search) {
      const searchRegexes =
        this.buildSearchRegexes(
          search
        );

      const searchableFields = [
        "title",
        "caseNumber",
        "archiveNumberOffice",
        "court.province",
        "court.city",
        "court.branch",
        "court.archiveNumberBranch",
        "branchHistory.archiveNumberBranch",
      ] as const;

      query.$or =
        searchableFields.flatMap(
          (field) =>
            searchRegexes.map(
              (regex) => ({
                [field]:
                  regex,
              })
            )
        );
    }

    return query;
  }

 

  public findByIdForLawyer(
    lawyerId:
      string,

    caseId:
      string,

    session?:
      ClientSession
  ) {
    const query =
      this.model.findOne({
        _id:
          this.toObjectId(
            caseId
          ),

        lawyerId:
          this.toObjectId(
            lawyerId
          ),
      });

    if (session) {
      query.session(
        session
      );
    }

    return query
      .lean()
      .exec();
  }

 
  public findDetailedByIdForLawyer(
    lawyerId:
      string,

    caseId:
      string
  ) {
    return this.model
      .findOne({
        _id:
          this.toObjectId(
            caseId
          ),

        lawyerId:
          this.toObjectId(
            lawyerId
          ),
      })
      .populate({
        path:
          "clientAssignments.clientId",

        select: [
          "fullName",
          "phone",
          "nationalId",
          "homeNumber",
          "birthday",
          "homeAddress",
          "represent",
        ].join(
          " "
        ),
      })
      .lean()
      .exec();
  }

 

  public findByCaseNumber(
    lawyerId:
      string,

    caseNumber:
      string,

    session?:
      ClientSession
  ) {
    const query =
      this.model.findOne({
        lawyerId:
          this.toObjectId(
            lawyerId
          ),

        caseNumber,
      });

    if (session) {
      query.session(
        session
      );
    }

    return query
      .lean()
      .exec();
  }

 

  public findByLawyerId(
    lawyerId:
      string,

    options:
      FindCasesOptions = {}
  ) {
    const page =
      Math.max(
        options.page ??
          1,
        1
      );

    const limit =
      Math.min(
        Math.max(
          options.limit ??
            10,
          1
        ),
        100
      );

    const skip =
      (
        page - 1
      ) *
      limit;

    const query =
      this.buildSearchQuery(
        lawyerId,
        options
      );

    return this.model
      .find(
        query
      )
      .sort({
        updatedAt:
          -1,
      })
      .skip(
        skip
      )
      .limit(
        limit
      )
      .populate({
        path:
          "clientAssignments.clientId",

        select: [
          "fullName",
          "phone",
          "nationalId",
          "homeNumber",
          "birthday",
          "homeAddress",
          "represent",
        ].join(
          " "
        ),
      })
      .lean()
      .exec();
  }

  public countByLawyerId(
    lawyerId:
      string,

    options:
      FindCasesOptions = {}
  ) {
    const query =
      this.buildSearchQuery(
        lawyerId,
        options
      );

    return this.model
      .countDocuments(
        query
      )
      .exec();
  }


  public async create(
    data:
      CreateCaseInput,

    session?:
      ClientSession
  ) {
    if (!session) {
      return this.model.create(
        data
      );
    }

    const [
      createdCase,
    ] =
      await this.model.create(
        [
          data,
        ],

        {
          session,
        }
      );

    return createdCase;
  }

  

  public deleteByIdForLawyer(
    lawyerId:
      string,

    caseId:
      string,

    session?:
      ClientSession
  ) {
    const query =
      this.model.findOneAndDelete({
        _id:
          this.toObjectId(
            caseId
          ),

        lawyerId:
          this.toObjectId(
            lawyerId
          ),
      });

    if (session) {
      query.session(
        session
      );
    }

    return query
      .lean()
      .exec();
  }


  public updateByIdForLawyer(
    lawyerId:
      string,

    caseId:
      string,

    update:
      UpdateQuery<Case>,

    session?:
      ClientSession
  ) {
    const query =
      this.model
        .findOneAndUpdate(
          {
            _id:
              this.toObjectId(
                caseId
              ),

            lawyerId:
              this.toObjectId(
                lawyerId
              ),
          },

          update,

          {
            new:
              true,

            runValidators:
              true,
          }
        );

    if (session) {
      query.session(
        session
      );
    }

    return query
      .lean()
      .exec();
  }

 

  public updateState(
    lawyerId:
      string,

    caseId:
      string,

    state:
      Case["state"]
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $set: {
            state,
          },
        },

        {
          new:
            true,

          runValidators:
            true,
        }
      )
      .lean()
      .exec();
  }

  

  public updateCourt(
    lawyerId:
      string,

    caseId:
      string,

    court:
      Partial<Court>,

    session?:
      ClientSession
  ) {
    const query =
      this.model
        .findOneAndUpdate(
          {
            _id:
              this.toObjectId(
                caseId
              ),

            lawyerId:
              this.toObjectId(
                lawyerId
              ),
          },

          {
            $set:
              this.buildNestedSet(
                "court",
                court
              ),
          },

          {
            new:
              true,

            runValidators:
              true,
          }
        );

    if (session) {
      query.session(
        session
      );
    }

    return query
      .lean()
      .exec();
  }

  
  public updateValueAndAssignments(
    lawyerId:
      string,

    caseId:
      string,

    value:
      number,

    assignments:
      CaseClientInput[],

    session?:
      ClientSession
  ) {
    const normalizedAssignments =
      assignments.map(
        (
          assignment
        ) => ({
          ...assignment,

          clientId:
            this.toObjectId(
              assignment.clientId
            ),
        })
      );

    const query =
      this.model
        .findOneAndUpdate(
          {
            _id:
              this.toObjectId(
                caseId
              ),

            lawyerId:
              this.toObjectId(
                lawyerId
              ),
          },

          {
            $set: {
              value,

              clientAssignments:
                normalizedAssignments,
            },
          },

          {
            new:
              true,

            runValidators:
              true,
          }
        );

    if (session) {
      query.session(
        session
      );
    }

    return query
      .lean()
      .exec();
  }



  public addOpposingParty(
    lawyerId:
      string,

    caseId:
      string,

    opposingParty:
      OpposingParty
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $push: {
            opposingParties:
              opposingParty,
          },
        },

        {
          new:
            true,

          runValidators:
            true,
        }
      )
      .lean()
      .exec();
  }

  public updateOpposingParty(
    lawyerId:
      string,

    caseId:
      string,

    opposingPartyId:
      string,

    opposingParty:
      Partial<OpposingParty>
  ) {
    return this.model
      .updateOne(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),

          "opposingParties._id":
            this.toObjectId(
              opposingPartyId
            ),
        },

        {
          $set:
            this.buildSubDocumentSet(
              "opposingParties",
              opposingParty
            ),
        },

        {
          runValidators:
            true,
        }
      )
      .exec();
  }

  public removeOpposingParty(
    lawyerId:
      string,

    caseId:
      string,

    opposingPartyId:
      string
  ) {
    return this.model
      .updateOne(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $pull: {
            opposingParties:
              {
                _id:
                  this.toObjectId(
                    opposingPartyId
                  ),
              },
          },
        }
      )
      .exec();
  }


  public addAssistantLawyer(
    lawyerId:
      string,

    caseId:
      string,

    assistantLawyer:
      LawyerContact
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $push: {
            assistantLawyers:
              assistantLawyer,
          },
        },

        {
          new:
            true,

          runValidators:
            true,
        }
      )
      .lean()
      .exec();
  }

  public updateAssistantLawyer(
    lawyerId:
      string,

    caseId:
      string,

    assistantLawyerId:
      string,

    assistantLawyer:
      Partial<LawyerContact>
  ) {
    return this.model
      .updateOne(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),

          "assistantLawyers._id":
            this.toObjectId(
              assistantLawyerId
            ),
        },

        {
          $set:
            this.buildSubDocumentSet(
              "assistantLawyers",
              assistantLawyer
            ),
        },

        {
          runValidators:
            true,
        }
      )
      .exec();
  }

  public removeAssistantLawyer(
    lawyerId:
      string,

    caseId:
      string,

    assistantLawyerId:
      string
  ) {
    return this.model
      .updateOne(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $pull: {
            assistantLawyers:
              {
                _id:
                  this.toObjectId(
                    assistantLawyerId
                  ),
              },
          },
        }
      )
      .exec();
  }


  public addOpposingLawyer(
    lawyerId:
      string,

    caseId:
      string,

    opposingLawyer:
      LawyerContact
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $push: {
            opposingLawyers:
              opposingLawyer,
          },
        },

        {
          new:
            true,

          runValidators:
            true,
        }
      )
      .lean()
      .exec();
  }

  public updateOpposingLawyer(
    lawyerId:
      string,

    caseId:
      string,

    opposingLawyerId:
      string,

    opposingLawyer:
      Partial<LawyerContact>
  ) {
    return this.model
      .updateOne(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),

          "opposingLawyers._id":
            this.toObjectId(
              opposingLawyerId
            ),
        },

        {
          $set:
            this.buildSubDocumentSet(
              "opposingLawyers",
              opposingLawyer
            ),
        },

        {
          runValidators:
            true,
        }
      )
      .exec();
  }

  public removeOpposingLawyer(
    lawyerId:
      string,

    caseId:
      string,

    opposingLawyerId:
      string
  ) {
    return this.model
      .updateOne(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $pull: {
            opposingLawyers:
              {
                _id:
                  this.toObjectId(
                    opposingLawyerId
                  ),
              },
          },
        }
      )
      .exec();
  }

 

  public addRelatedPerson(
    lawyerId:
      string,

    caseId:
      string,

    relatedPerson:
      RelatedPerson
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $push: {
            relatedPeople:
              relatedPerson,
          },
        },

        {
          new:
            true,

          runValidators:
            true,
        }
      )
      .lean()
      .exec();
  }

  public updateRelatedPerson(
    lawyerId:
      string,

    caseId:
      string,

    relatedPersonId:
      string,

    relatedPerson:
      Partial<RelatedPerson>
  ) {
    return this.model
      .updateOne(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),

          "relatedPeople._id":
            this.toObjectId(
              relatedPersonId
            ),
        },

        {
          $set:
            this.buildSubDocumentSet(
              "relatedPeople",
              relatedPerson
            ),
        },

        {
          runValidators:
            true,
        }
      )
      .exec();
  }

  public removeRelatedPerson(
    lawyerId:
      string,

    caseId:
      string,

    relatedPersonId:
      string
  ) {
    return this.model
      .updateOne(
        {
          _id:
            this.toObjectId(
              caseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),
        },

        {
          $pull: {
            relatedPeople:
              {
                _id:
                  this.toObjectId(
                    relatedPersonId
                  ),
              },
          },
        }
      )
      .exec();
  }
}