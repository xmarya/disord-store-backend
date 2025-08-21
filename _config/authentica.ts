import { AuthenticaBalance, AuthenticaFullRequest, AuthenticaRequestEndpoint, AuthenticaResponse } from "@Types/AuthenticaOTP";
import { catchAsync } from "@utils/catchAsync";

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

  const data = await response.json();

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
  if (data.balance) return next(); // enough balance ? move to send the otp via email or SMS

  request.loginMethod = { email: "" };
  console.log("loginMethod changed to default ");
  next();
});

export default authentica;
