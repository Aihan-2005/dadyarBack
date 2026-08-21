export type OtpDeliveryChannel = "phone" | "email";

export interface SendOtpDeliveryInput {
  channel: OtpDeliveryChannel;

  destination: string;

  code: string;
}

export interface OtpDelivery {
  send(input: SendOtpDeliveryInput): Promise<void>;
}
