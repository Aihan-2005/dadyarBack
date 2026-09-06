declare module "melipayamak" {
  export interface MelipayamakSendResponse {
    Value: string;
    RetStatus: number;
    StrRetStatus: string;
  }

  export interface MelipayamakSmsClient {
    sendByBaseNumber(
      text: string,
      to: string,
      bodyId: number,
    ): Promise<MelipayamakSendResponse>;
  }

  export default class MelipayamakApi {
    constructor(username: string, password: string);

    sms(
      method?: "rest" | "soap",
      type?: "async" | "sync",
    ): MelipayamakSmsClient;
  }
}
