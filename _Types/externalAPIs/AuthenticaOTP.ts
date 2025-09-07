type PhoneNumberDataBody = {
  method: "sms" | "whatsapp";
  phone: `+966${string}`;
  template_id: "5";
  fallback_phone?: `+966${string}`;
  fallback_email: string;
  otp?: string;
};

type EmailDataBody = {
  method: "email";
  email: string;
};

type SuccessSendOTP = {
  success: true;
  data: null;
  message: string;
};

type FailedOTP = {
  success: false;
  message: string;
  errors: {
    errorName: string[];
  };
};

export type AuthenticaSendOTPDataBody<T = "email" | "phoneNumber"> = T extends "email" ? EmailDataBody : PhoneNumberDataBody;

export type AuthenticaVerifyOTPDataBody = {
  temporeToken: string;
  otp: string;
  phone?: `+966${string}`;
  email?: string;
};

type SuccessVerifyOTP = {
  status: true;
  message: "OTP verified successfully";
};

type FailedVerifyOTP = {
  status: false;
  message: "Failed to verify OTP";
};

export type AuthenticaBalance = {
  success: boolean;
  data: Record<"balance", number>;
  message: string;
};

export type AuthenticaRequestEndpoint = "/send-otp" | "/verify-otp";
export type AuthenticaSendOTPResponse = SuccessSendOTP | FailedOTP;
export type AuthenticaVerifyOTPResponse = SuccessVerifyOTP | FailedVerifyOTP;

export type AuthenticaFullRequest =
  | {
      requestEndpoint: "/send-otp";
      body: AuthenticaSendOTPDataBody;
    }
  | {
      requestEndpoint: "/verify-otp";
      body: Omit<AuthenticaVerifyOTPDataBody, "temporeToken">;
    };

export type AuthenticaResponse<T extends AuthenticaRequestEndpoint> = T extends "/send-otp" ? AuthenticaSendOTPResponse : AuthenticaVerifyOTPResponse;
