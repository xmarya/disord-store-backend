import { AuthenticaFullRequest, AuthenticaRequestType, AuthenticaResponse } from "../_Types/AuthenticaOTP";
import { AppError } from "../_utils/AppError";

const API_URL_PRODUCTION = (requestType: AuthenticaRequestType) => `https://api.authentica.sa/api/v2${requestType}`;
const API_URL_MOCK = (requestType: AuthenticaRequestType) => `https://private-anon-550e751df7-authenticasa.apiary-mock.com/api/v2${requestType}`;
const API_KEY = process.env.AUTHENTICA_API_KEY;

const headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "X-Authorization": API_KEY,
};

async function authentica({requestType,body}:AuthenticaFullRequest) {
    const URL = process.env.NODE_ENV === "development" ? API_URL_MOCK(requestType) : API_URL_PRODUCTION(requestType);

    const response = await fetch(URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json() as AuthenticaResponse;
    console.log("wahtauthenticadata", data);
    // if(data.statusCode !== 200) return new AppError(data.statusCode, data.message);

    console.log("AUTHENTICA SUCCESS 🎉");

    return data;

}

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