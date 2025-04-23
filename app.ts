import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import ratelimit from "express-rate-limit";
import {router as userRouter} from "./_routers/userRoutes";
import { router as dashboardRouter } from "./_routers/dashboard";


const app = express();
app.set("trust proxy", true);
const limiter = ratelimit({
        max: 100, // #requests per hour.
        windowMs: 60 * 60 * 100, // the calculation of 1 hour.
        message: "We've got too many requests from this IP, Try again after 1 hour",
});
app.use("/api", limiter);

// express doesn't't support sending json format in the request, must use express.json() md,
// this line below parsing the coming data inside the request with size limit.
// Body Parsing with raw body preservation
app.use(express.json({ 
  limit: "15kb",
  verify: (req, res, buf) => {
    (req as any).rawBody = buf; // Store raw body for HMAC verification
  }
}));
app.use(express.urlencoded({ limit: "1.5mb", extended:true})); // parsing HTML for submission (extended:true to allow nested objects)
app.use(cookieParser()); // the above line parsers the data from the body, this line parses the data from the cookies .
app.use(mongoSanitize());
app.use(cors());

app.use("/api/v1/auth/", userRouter);
app.use("/api/v1/dashboard", dashboardRouter);



export default app;

