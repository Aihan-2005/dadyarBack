import mongoose from "mongoose";
import { env } from "./env";

export class Database {
  private readonly url =
    env.MONGO_URI;

  public async connect(): Promise<void> {
    await mongoose.connect(
      this.url,
    );

    console.log(
      "MongoDB connected successfully",
    );
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected successfully",
    );
  }
}