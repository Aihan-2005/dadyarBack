import { env } from "../../config/env";

import type { SmsProvider } from "./sms.provider";

import { SmsIrProvider } from "./smsIr.provider";

import { MelipayamakProvider } from "./melipayamak.provider";

export function createSmsProvider(): SmsProvider {
  switch (env.SMS_PROVIDER) {
    case "SMS_IR":
      return new SmsIrProvider();

    case "MELIPAYAMAK":
      return new MelipayamakProvider();
  }
}
