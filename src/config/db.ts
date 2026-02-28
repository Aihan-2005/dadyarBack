import mongoose from "mongoose";
import { env } from "./env";

export class Database {
  private readonly url = env.MONGO_URI;

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.url);
    } catch (e) {
      console.error(e)
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
    } catch (e) {
      console.error(e)
    }
  }
}
