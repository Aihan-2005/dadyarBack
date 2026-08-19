import {
  CreateReminderInput,
  Notification,
} from "../interfaces/notification.interface";
import { NotificationModel } from "../models/notification.model";
import { BaseRepository } from "./base.repository";

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(NotificationModel);
  }

    private serializeDoc(doc: any) {
    if (!doc) {
      return doc;
    }

    const { _id, __v, ...rest } = doc;

    return {
      id: _id?.toString(),
      ...rest,
    };
  }

  private serializeDocs(docs: any[]) {
    return docs.map((doc) => this.serializeDoc(doc));
  }

    public async findByLawyerId(lawyerId: string) {
    const docs = await this.model
      .find({ lawyerId: this.toObjectId(lawyerId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return this.serializeDocs(docs);
  }

  public async findByIdForLawyer(lawyerId: string, notificationId: string) {
    const doc = await this.model
      .findOne({
        _id: this.toObjectId(notificationId),
        lawyerId: this.toObjectId(lawyerId),
      })
      .lean()
      .exec();

    return this.serializeDoc(doc);
  }

    public async create(data: CreateReminderInput) {
    const doc = await this.model.create(data);

    return this.serializeDoc(doc.toObject());
  }


   public async markRead(lawyerId: string, notificationId: string) {
    const doc = await this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(notificationId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $set: { status: "read", readAt: new Date() },
        },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    return this.serializeDoc(doc);
  }

  public async setCompleted(
    lawyerId: string,
    notificationId: string,
    completed: boolean,
  ) {
    const doc = await this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(notificationId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $set: { completed },
        },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    return this.serializeDoc(doc);
  }

  public async markDismissed(lawyerId: string, notificationId: string) {
    const doc = await this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(notificationId),
          lawyerId: this.toObjectId(lawyerId),
        },
        {
          $set: { status: "dismissed" },
        },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    return this.serializeDoc(doc);
  }

  public markAllRead(lawyerId: string) {
    return this.model
      .updateMany(
        {
          lawyerId: this.toObjectId(lawyerId),
          status: "unread",
        },
        {
          $set: { status: "read", readAt: new Date() },
        },
      )
      .exec();
  }

  public async deleteByIdForLawyer(lawyerId: string, notificationId: string) {
    const doc = await this.model
      .findOneAndDelete({
        _id: this.toObjectId(notificationId),
        lawyerId: this.toObjectId(lawyerId),
      })
      .lean()
      .exec();

    return this.serializeDoc(doc);
  }
}