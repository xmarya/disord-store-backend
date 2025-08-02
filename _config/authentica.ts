import { AuthenticaBalance, AuthenticaFullRequest, AuthenticaRequestEndpoint, AuthenticaResponse } from "../_Types/AuthenticaOTP";
import { catchAsync } from "../_utils/catchAsync";
import createUserLoginToken from "../_utils/jwtToken/createUserLoginToken";

const API_URL = (requestEndpoint: AuthenticaRequestEndpoint) => `https://api.authentica.sa/api/v2${requestEndpoint}`;

async function authentica({ requestEndpoint, body }: AuthenticaFullRequest) {
  // const development = process.env.NODE_ENV === "development";
  // const API_KEY = development ? process.env.AUTHENTICA_API_KEY_TEST : process.env.AUTHENTICA_API_KEY;
  const API_KEY = process.env.AUTHENTICA_API_KEY_TEST;
  const URL = API_URL(requestEndpoint);

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Authorization": API_KEY,
  };

  const response = await fetch(URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = (await response.json());

  return data;
}

export const getAuthenticaBalance = catchAsync(async (request, response, next) => {
  const URL = "https://api.authentica.sa/api/v2/balance";
  const API_KEY = process.env.AUTHENTICA_API_KEY_TEST;

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Authorization": API_KEY,
  };

  const result = await fetch(URL, {
    method: "GET",
    headers,
  });

  const { data } = (await result.json()) as AuthenticaBalance;

  console.log(data.balance, !!data.balance);
  if(data.balance) return next(); // enough balance ? move to send the otp

  await createUserLoginToken(request.body.user, response);
  response.status(200).json({
    success:true,
    message: "successful login"
  });
});

export default authentica;

// TODOs:
// 1- util for generating 6-digits, time sensitive OTP
// 2- create a route for sending the OTP to authentica in order to be send then to the end user
// 3- cache the OTP-phoneNumber pair
// 4- create a route for verifying

/*
  Trigger: The OTP flow starts with a trigger event. This can be an action such as a user attempting to log in or register.
OTP Generation: Upon receiving the trigger, the server generates a unique OTP. This OTP is usually a random, time-sensitive code.
OTP Delivery: The generated OTP is delivered to the user through their chosen medium, such as email or SMS.
User Input: The user receives the OTP and enters it into the application.
OTP Verification: If the OTP verification is successful, the user is authenticated and allowed to proceed with their intended action.

*/
