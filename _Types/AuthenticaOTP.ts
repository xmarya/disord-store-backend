interface AuthenticaSendOTPDataBody {
  method: "sms" | "whatsapp";
  phone: `+966${string}`;
  template_id: "5";
  fallback_email: string;
  otp: string;
}

interface AuthenticaVerifyOTPDataBody {
  phone: `+966${string}`;
  email: string;
  otp: string;
}

export type AuthenticaRequestType = "/send-otp" | "/verify-otp";

export type AuthenticaFullRequest =
  | {
      requestType: "/send-otp";
      body: AuthenticaSendOTPDataBody;
    }
  | {
      requestType: "/verify-otp";
      body: AuthenticaVerifyOTPDataBody;
    };

type SuccessOTP = {
  success: true;
  data: null;
  message: "OTP send successfully";
};
type FailedOTP = {
  success: false;
  message: string;
};

type ErrorOTP = {
  message: string;
  errors: {
    errorName: string[];
  };
};

export type AuthenticaResponse = SuccessOTP | FailedOTP | ErrorOTP;
