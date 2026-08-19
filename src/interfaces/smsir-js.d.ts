declare module "smsir-js" {
  export interface SmsIrVerifyParameter {
    name: string;

    value: string;
  }

  export interface SmsIrVerifyResponseData {
    status: number;

    message: string;

    data?: {
      messageId?: number;

      cost?: number;
    };
  }

  export interface SmsIrHttpResponse<T> {
    status: number;

    data: T;
  }

  export class Smsir {
    constructor(apiKey: string, lineNumber?: number);

    SendVerifyCode(
      mobile: string,
      templateId: number,
      parameters: SmsIrVerifyParameter[],
    ): Promise<SmsIrHttpResponse<SmsIrVerifyResponseData>>;
  }
}
