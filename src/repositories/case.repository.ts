import {
  Case,
  Client,
  Court,
  CreateCaseInput,
  LawyerContact,
  OpposingParty,
  RelatedPerson,
  FindCasesOptions,
} from "../interfaces/case.interface";
import { CaseModel } from "../models/case.model";
import { BaseRepository } from "./base.repository";

// NOTE: all public methods return promises
export class CaseRepository extends BaseRepository<Case> {
  constructor() {
    super(CaseModel);
  }

  // Helper Methods
  private buildSubDocumentSet(
    path: string,
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateData[`${path}.$.${key}`] = value;
      }
    }

    return updateData;
  }

  private buildNestedSet(
    path: string,
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateData[`${path}.${key}`] = value;
      }
    }

    return updateData;
  }

  // Finding Methods
  public findById(id: string) {
    return this.model.findById(this.toObjectId(id)).lean().exec();
  }

  public findByIdForLawyer(lawyerId: string, caseId: string) {
    return this.model
      .findOne({
        _id: this.toObjectId(caseId),
        lawyerId: this.toObjectId(lawyerId),
      })
      .lean()
      .exec();
  }

  public findByCaseNumber(lawyerId: string, caseNumber: string) {
    return this.model
      .findOne({
        lawyerId: this.toObjectId(lawyerId),
        caseNumber,
      })
      .lean()
      .exec();
  }

  public findByLawyerId(lawyerId: string, options: FindCasesOptions = {}) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      lawyerId: this.toObjectId(lawyerId),
    };

    if (options.state) {
      query.state = options.state;
    }

    if (options.search) {
      query.$or = [
        { title: { $regex: options.search, $options: "i" } },
        { caseNumber: { $regex: options.search, $options: "i" } },
        { "court.province": { $regex: options.search, $options: "i" } },
        { "court.city": { $regex: options.search, $options: "i" } },
        { "clients.fullName": { $regex: options.search, $options: "i" } },
        {
          "opposingParties.fullName": { $regex: options.search, $options: "i" },
        },
      ];
    }

    return this.model
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  public countByLawyerId(lawyerId: string, options: FindCasesOptions = {}) {
    const query: Record<string, unknown> = {
      lawyerId: this.toObjectId(lawyerId),
    };

    if (options.state) {
      query.state = options.state;
    }

    if (options.search) {
      query.$or = [
        { title: { $regex: options.search, $options: "i" } },
        { caseNumber: { $regex: options.search, $options: "i" } },
        { "court.province": { $regex: options.search, $options: "i" } },
        { "court.city": { $regex: options.search, $options: "i" } },
        { "clients.fullName": { $regex: options.search, $options: "i" } },
        {
          "opposingParties.fullName": { $regex: options.search, $options: "i" },
        },
      ];
    }

    return this.model.countDocuments(query).exec();
  }

  // Create And Updating Methods
  public create(data: CreateCaseInput) {
    return this.model.create(data);
  }

  public updateByIdForLawyer(
    lawyerId: string,
    caseId: string,
    data: Partial<Case>,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        data,
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  public updateState(lawyerId: string, caseId: string, state: string) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        { $set: { state } },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  public updateCourt(lawyerId: string, caseId: string, court: Partial<Court>) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $set: this.buildNestedSet("court", court),
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  // Client Methods
  public addClient(lawyerId: string, caseId: string, client: Client) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        { $push: { clients: client } },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  public updateClient(
    lawyerId: string,
    caseId: string,
    clientId: string,
    client: Partial<Client>,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
          "clients._id": this.toObjectId(clientId),
        },
        {
          $set: this.buildSubDocumentSet("clients", client),
        },
        {
          runValidators: true,
        },
      )
      .exec();
  }

  public removeClient(lawyerId: string, caseId: string, clientId: string) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $pull: {
            clients: { _id: this.toObjectId(clientId) },
          },
        },
      )
      .exec();
  }

  // Opposing Party Methods
  public addOpposingParty(
    lawyerId: string,
    caseId: string,
    opposingParty: OpposingParty,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        { $push: { opposingParties: opposingParty } },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  public updateOpposingParty(
    lawyerId: string,
    caseId: string,
    opposingPartyId: string,
    opposingParty: Partial<OpposingParty>,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
          "opposingParties._id": this.toObjectId(opposingPartyId),
        },
        {
          $set: this.buildSubDocumentSet("opposingParties", opposingParty),
        },
        {
          runValidators: true,
        },
      )
      .exec();
  }

  public removeOpposingParty(
    lawyerId: string,
    caseId: string,
    opposingPartyId: string,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $pull: {
            opposingParties: { _id: this.toObjectId(opposingPartyId) },
          },
        },
      )
      .exec();
  }

  // Assistant Lawyer Methods
  public addAssistantLawyer(
    lawyerId: string,
    caseId: string,
    assistantLawyer: LawyerContact,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        { $push: { assistantLawyers: assistantLawyer } },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  public updateAssistantLawyer(
    lawyerId: string,
    caseId: string,
    assistantLawyerId: string,
    assistantLawyer: Partial<LawyerContact>,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
          "assistantLawyers._id": this.toObjectId(assistantLawyerId),
        },
        {
          $set: this.buildSubDocumentSet("assistantLawyers", assistantLawyer),
        },
        {
          runValidators: true,
        },
      )
      .exec();
  }

  public removeAssistantLawyer(
    lawyerId: string,
    caseId: string,
    assistantLawyerId: string,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $pull: {
            assistantLawyers: { _id: this.toObjectId(assistantLawyerId) },
          },
        },
      )
      .exec();
  }

  // Opposing Lawyer Methods
  public addOpposingLawyer(
    lawyerId: string,
    caseId: string,
    opposingLawyer: LawyerContact,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        { $push: { opposingLawyers: opposingLawyer } },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  public updateOpposingLawyer(
    lawyerId: string,
    caseId: string,
    opposingLawyerId: string,
    opposingLawyer: Partial<LawyerContact>,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
          "opposingLawyers._id": this.toObjectId(opposingLawyerId),
        },
        {
          $set: this.buildSubDocumentSet("opposingLawyers", opposingLawyer),
        },
        {
          runValidators: true,
        },
      )
      .exec();
  }

  public removeOpposingLawyer(
    lawyerId: string,
    caseId: string,
    opposingLawyerId: string,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $pull: {
            opposingLawyers: { _id: this.toObjectId(opposingLawyerId) },
          },
        },
      )
      .exec();
  }

  // Related People Methods
  public addRelatedPerson(
    lawyerId: string,
    caseId: string,
    relatedPerson: RelatedPerson,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        { $push: { relatedPeople: relatedPerson } },
        {
          new: true,
          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  public updateRelatedPerson(
    lawyerId: string,
    caseId: string,
    relatedPersonId: string,
    relatedPerson: Partial<RelatedPerson>,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
          "relatedPeople._id": this.toObjectId(relatedPersonId),
        },
        {
          $set: this.buildSubDocumentSet("relatedPeople", relatedPerson),
        },
        {
          runValidators: true,
        },
      )
      .exec();
  }

  public removeRelatedPerson(
    lawyerId: string,
    caseId: string,
    relatedPersonId: string,
  ) {
    return this.model
      .updateOne(
        {
          _id: this.toObjectId(caseId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $pull: {
            relatedPeople: { _id: this.toObjectId(relatedPersonId) },
          },
        },
      )
      .exec();
  }
}
