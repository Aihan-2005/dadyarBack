export interface SmsTemplateParameter {
  name: string;
  value: string;
}

export interface SendTemplateSmsInput {
  phone: string;

  templateId: number;

  parameters: ReadonlyArray<SmsTemplateParameter>;
}

export interface SmsSendResult {
  provider: "SMS_IR";

  messageId: number;

  cost: number;
}
