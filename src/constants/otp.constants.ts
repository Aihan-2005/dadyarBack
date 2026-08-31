export const OTP_PURPOSES = {
  OTP_LOGIN: "OTP_LOGIN",

  PASSWORD_CHANGE: "PASSWORD_CHANGE",

  PASSWORD_RESET: "PASSWORD_RESET",

  PHONE_VERIFICATION: "PHONE_VERIFICATION",

  CLIENT_SIGNUP: "CLIENT_SIGNUP",
} as const;

export const OTP_CHANNEL = ["phone", "email"] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[keyof typeof OTP_PURPOSES];
export type OtpChannel = (typeof OTP_CHANNEL)[number];
