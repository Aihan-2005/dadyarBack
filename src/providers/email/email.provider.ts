import { SendEmailInput } from "../../interfaces/email.interface";

export interface EmailProvider {
  isAvailable(): boolean;

  send(input: SendEmailInput): Promise<void>;
}
