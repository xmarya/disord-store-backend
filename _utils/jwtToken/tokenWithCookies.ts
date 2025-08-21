import type { CookieOptions, Response } from "express";

export default function tokenWithCookies(response:Response, token:string) {
// this function will make the token to be sent with requests and stored in the browser via cookies.
    const cookieOpt:CookieOptions = {
        // reference => https://stackoverflow.com/questions/74765575/why-was-max-age-introduced-for-cookies-when-we-already-had-expires
        maxAge: 3600, // one-hour, => much accurate
        // expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // => error-prone
        httpOnly: true, // means the cookie can't be accessed or modified in anyway by the browser in client's machine which help us avoiding the XSS attacks. but this
        // will make us face a problem when implementing logout functionality, so to solve this without losing one of our security pieces
        // we're going to create a route for logout and send back via it a cookie with the exact same name but without the token
        // and that is going to overwrite the current cookie in the browser .
        secure: true,
    }
    // if (process.env.NODE_ENV === "production") cookieOpt.secure = true;
    //(cockie's name, data we want to send in the cookie, opts for cookie).
    response.cookie("jwt", token, cookieOpt);
}