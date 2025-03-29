import cookieParser from "cookie-parser";
import express from "express";
import ratelimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import { router as storeRouter } from "./_routers/storeRoutes";
import { router as authRouter } from "./_routers/authRoutes";


const app = express();
const limiter = ratelimit({
        max: 100, // #requests per hour.
        windowMs: 60 * 60 * 100, // the calculation of 1 hour.
        message: "We've got too many requests from this IP, Try again after 1 hour"
});
app.use("/api", limiter);

// express doesn't't support sending json format in the request, must use express.json() md,
// this line below parsing the coming data inside the request with size limit.
app.use(express.json({ limit: "15kb"}));
app.use(express.urlencoded({ limit: "1.5mb", extended:true})); // parsing HTML for submission (extended:true to allow nested objects)
app.use(cookieParser()); // the above line parsers the data from the body, this line parses the data from the cookies .
app.use(mongoSanitize());
app.use(cors());

app.use("/api/v1/stores", storeRouter);
app.use("/api/v1/auth", authRouter);



export default app;

