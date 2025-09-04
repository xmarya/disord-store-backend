import type { CookieOptions, Response } from "express";

export default function tokenWithCookies(response:Response, token:string) {
    const options:CookieOptions = process.env.NODE_ENV === "development" ? {secure: false, sameSite:"lax"} : {secure: true, sameSite:"none"}
// this function will make the token to be sent with requests and stored in the browser via cookies.
    const cookieOpt:CookieOptions = {
        // reference => https://stackoverflow.com/questions/74765575/why-was-max-age-introduced-for-cookies-when-we-already-had-expires
        maxAge: 60 * 60 * 1000 ,// 1 hour in ms => much accurate
        // expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // => error-prone
        httpOnly: true, // means the cookie can't be accessed or modified in anyway by the browser in client's machine which help us avoiding the XSS attacks. but this
        // will make us face a problem when implementing logout functionality, so to solve this without losing one of our security pieces
        // we're going to create a route for logout and send back via it a cookie with the exact same name but without the token
        // and that is going to overwrite the current cookie in the browser .
        // secure: false, /* CHANGE LATER: to true after deploying the front-end */
        // sameSite: "lax", //CHANGE LATER: to "none" for future integration with analytics service, discord signin
        ...options
    }
    response.cookie("jwt", token, cookieOpt);
}