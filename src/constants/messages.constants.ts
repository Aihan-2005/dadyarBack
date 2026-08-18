export const MESSAGES = {
  noEmailNorPhone: {
    en: "No email and no phone exsist for the user",
    fa: "نه ایمیل و نه شماره تلفنی برای کاربر پیدا نشد",
  },

  emailExsist: {
    en: "User with this email already exsist",
    fa: "گاربری با این ایمیل از قبل موجود است",
  },

  phoneExsist: {
    en: "User with this phone already exsist",
    fa: "کاربری با این شماره تلفن از قبل موجود است",
  },

  barExsist: {
    en: "User with this barLicence already exsist",
    fa: "کاربری با این شماره پروانه وکالت از قبل موجود است",
  },

  noUserWithEmailOrPhone: {
    en: "No user was found with this email/phone",
    fa: "هیچ کاربری با این ایمیل/شماره یافت نشد",
  },

  noUserWithId: {
    en: "No user was found with this id",
    fa: "هیچ کاربری با این شناسه یافت نشد",
  },

  // noStudyWithId: {
  //   en: "No Study Was Found With This Id",
  //   fa: "هیچ تحصیلی با این شناسه یافت نشد",
  // },

  noWorkExperienceWithId: {
    en: "No Work Experience Was Found With This Id",
    fa: "هیچ سابقه کاری با این شناسه یافت نشد",
  },

  noSkillWithName: {
    en: "No Skill With The Selected Name Was Found",
    fa: "هیچ مهارت با اسم ذکر شده یافت نشد",
  },

  noLanguageFound: {
    en: "Selected Language Was Not Found",
    fa: "زبان انتخاب شده یافت نشد",
  },

  emailorPasswordWrong: {
    en: "Email Or Password Are Wrong",
    fa: "ایمیل یا گذرواره اشتباه است",
  },

  phoneOrPasswordWrong: {
    en: "Phone Or Password Are Wrong",
    fa: "شماره یا گذرواره اشتباه است",
  },

  notValidId: {
    en: "The Given Id Is Not A Valid Id",
    fa: "شناسه ی داده شده معتبر نیست",
  },

  userCreated: {
    en: "User Was Created Successfully",
    fa: "کاربر با موفقیت درست شد",
  },

  invalidRefToken: {
    en: "Invalid Refresh Token",
    fa: "رفرش توکن داده شده معتبر نیست",
  },

  noRefToken: {
    en: "Refresh Token Expired Or Was Not Found",
    fa: "رفرش توکن منتهی شده یا پیدا نشد",
  },

  noTokenFound: {
    en: "No AccessToken Was Given In The Headers",
    fa: "هیچ توکنی فرستاده نشده بود",
  },

  refTokenMandatory: {
    en: "RefreshToken is Mandatory",
    fa: "رفرش توکن الزامی است",
  },

  unauthorized: {
    en: "Invalid or expired token",
    fa: "توکن داده شده معتبر نیست یا منثضی شده",
  },

  unableToFindUser: {
    en: "Unable To Find The User",
    fa: "کاربر موردنظر یافت نشد",
  },

  serverError: {
    en: "An Unexcpected Error Happend In The Server",
    fa: "یک ارور غیر منتظره در سرور رخ داد",
  },

  invalidObjectId: {
    en: "The Given Id Is Not A Proper ObjectId",
    fa: "آیدی داده شده آبجکت آیدیه درستی نیست",
  },

  caseNeedClient: {
    en: "Case Need Atleast One Client",
    fa: "هر پرونده حداقل به یک موکل نیاز دارد",
  },
  endYearBeforeStart: {
    en: "End Year Can't Be Before Start Year",
    fa: "سال انتها نمیتواند ثبل از شروع باشد",
  },
  caseExsist: {
    en: "Case Number Already Exists",
    fa: "پرونده از قبل موجود بود",
  },
  caseNotFound: {
    en: "Case Was Not Found",
    fa: "پرونده یافت نشد",
  },
  noCaseFieldFound: {
    en: "At least one case field is required",
    fa: "حداقل یک فیلد برای پرونده باید داده بشود",
  },
  noCourtFieldFound: {
    en: "At least one court field is required",
    fa: "حداقل یک فیلد برای دادگاه باید داده بشود",
  },
  noClientFieldFound: {
    en: "At least one client field is required",
    fa: "حداقل یک فیلد برای کابر باید داده بشود",
  },
  noOpposingFieldFound: {
    en: "At least one opposing party field is required",
    fa: "حداقل یک فیلد برای طرف مخالف باید داده بشود",
  },
  noOpposingLawyerFiledFound: {
    en: "At least one opposing lawyer field is required",
    fa: "حداقل یک فیلد برای وکیل مخالف باید داده بشود",
  },
  noAssistantFieldFound: {
    en: "At least one assistant lawyer field is required",
    fa: "حداقل یک فیلد برای وکیل مساعد باید داده بشود",
  },
  noRelatedPersonFieldFound: {
    en: "At least one related person field is required",
    fa: "حداقل یک فیلد برای شخص مرتبط باید داده بشود",
  },
  clientNotFound: {
    en: "Client was not found",
    fa: "کاربر یافت نشد",
  },
  opposingNotFound: {
    en: "opposing party was found",
    fa: "هیچ فردی از گروه مخالف پیدا نشد",
  },
  assistantNotFound: {
    en: "Assistant lawyer not found",
    fa: "وکیل مساعد یافت نشد",
  },
  opposingLawyernotFound: {
    en: "Opposing lawyer not found",
    fa: "وکیل مخالف پیدا نشد",
  },
  relatedPersonNotFound: {
    en: "Related person not found",
    fa: "فرد مرتبط یافت نشد",
  },
  invalidCredentials: {
    en: "Email/phone or password is incorrect",
    fa: "ایمیل/شماره همراه یا رمز عبور صحیح نیست",
  },

  duplicateField: {
    en: "A record with this value already exists",
    fa: "رکوردی با این مقدار از قبل وجود دارد",
  },

  passwordTooLong: {
    en: "Password must not be longer than 72 bytes",
    fa: "رمز عبور نباید بیشتر از ۷۲ بایت باشد",
  },

  accountSuspended: {
    en: "This account has been suspended",
    fa: "این حساب کاربری تعلیق شده است",
  },

  accountRejected: {
    en: "This lawyer account has been rejected",
    fa: "حساب وکیل موردنظر رد شده است",
  },

  accountPendingVerification: {
    en: "Lawyer account verification is not completed",
    fa: "فرایند تأیید حساب وکیل هنوز تکمیل نشده است",
  },

  invalidAccountRole: {
    en: "The account role is not allowed",
    fa: "نقش این حساب اجازه دسترسی به این بخش را ندارد",
  },
  nationalIdExists: {
    en: "User with this national id already exsist",
    fa: "کاربر با این کد ملی از قبل موجود است",
  },
  clientDataConflict: {
    en: "Client with the same phone number but different national id exsist",
    fa: "موکلی با همین شماره اما کد ملی متفاوت وجود دارد",
  },
  notYetBorn: {
    en: "Birthday can't be in the furture",
    fa: "تاریخ تولد نمی‌تواند در آینده باشد",
  },
  invalidPhoneFormat: {
    en: "The given phone number is not a valid iranian phone number",
    fa: "شماره تلفن داده شده صحیح نیست",
  },
  assignmentTotalMismatch: {
    en: "The assigned client amounts must equal the total case value",
    fa: "مجموع مبالغ تعیین‌شده برای موکلان باید برابر ارزش کل پرونده باشد",
  },

  duplicateCaseClient: {
    en: "The same client cannot be added to a case more than once",
    fa: "یک موکل نمی‌تواند بیش از یک بار به پرونده اضافه شود",
  },

  clientFullNameRequired: {
    en: "The client's full name is required for a new client",
    fa: "برای ثبت موکل جدید، نام کامل الزامی است",
  },

  unableToCreateCase: {
    en: "Unable to create the case",
    fa: "ایجاد پرونده امکان‌پذیر نیست",
  },

  valueAndClientsRequiredTogether: {
    en: "Case value and clients must be updated together",
    fa: "برای تغییر مقادیر قرار قرار داد باید ارزش قرار داد و مقدار داده شده به همه موکلا داده شود",
  },

  nonCashPaymentDescriptionRequired: {
    en: "Description is required for non-cash payments",
    fa: "برای پرداخت غیرنقدی، توضیحات الزامی است",
  },

  noPaymentFieldFound: {
    en: "At least one payment field must be provided",
    fa: "حداقل یک فیلد پرداخت باید ارسال شود",
  },
  paymentNotFound: {
    en: "Payment not found",
    fa: "پرداخت یافت نشد",
  },

  clientNotAssignedToCase: {
    en: "This client is not assigned to this case",
    fa: "این موکل به این پرونده اختصاص داده نشده است",
  },

  paymentTotalExceedsAssignedAmount: {
    en: "Total payments cannot exceed the client's assigned amount",
    fa: "مجموع پرداخت‌ها نمی‌تواند از مبلغ اختصاص‌یافته به موکل بیشتر باشد",
  },

  duplicatePaymentInRequest: {
    en: "The same payment cannot be submitted more than once",
    fa: "یک پرداخت نمی‌تواند بیش از یک بار ارسال شود",
  },
  expenseNotFound: {
    en: "Expense not found",
    fa: "هزینه یافت نشد",
  },

  duplicateExpenseInRequest: {
    en: "The same expense cannot be submitted more than once",
    fa: "یک هزینه نمی‌تواند بیش از یک بار ارسال شود",
  },
  otpInvalidOrExpired: {
    en: "The verification code is invalid or expired.",
    fa: "کد تأیید نامعتبر است یا منقضی شده است.",
  },

  otpAttemptsExceeded: {
    en: "Too many verification attempts. Request a new code.",
    fa: "تعداد تلاش‌های تأیید بیش از حد مجاز است. کد جدیدی درخواست کنید.",
  },

  otpResendCooldown: {
    en: "Please wait before requesting another verification code.",
    fa: "لطفاً برای درخواست مجدد کد تأیید کمی صبر کنید.",
  },

  otpDeliveryFailed: {
    en: "Unable to send the verification code.",
    fa: "ارسال کد تأیید با مشکل مواجه شد.",
  },

  invalidOtpFormat: {
    en: "Verification code must be exactly 6 digits.",

    fa: "کد تأیید باید دقیقاً ۶ رقم باشد.",
  },

  phoneRequiredForPasswordChange: {
    en: "A phone number is required to change the password.",

    fa: "برای تغییر رمز عبور، ثبت شماره همراه الزامی است.",
  },

  passwordChangedSuccessfully: {
    en: "Password changed successfully.",

    fa: "رمز عبور با موفقیت تغییر کرد.",
  },
};
