import type {Request, Response, NextFunction} from "express";
import { getCachedData } from "./globalCache";

type CacheKeys = "product:query" | "store:query";

const checkCache = (cacheKey:CacheKeys) => {
    return async (request:Request, response:Response, next:NextFunction) => {
        console.log("checkCache");
        // const key = `${cacheKey.split(":")[0]}`
        // alternative 👇🏻 which keeps the :
        const key = `${cacheKey.slice(0, cacheKey.indexOf(":") + 1)}`;
        const query = JSON.stringify(request.query);
        const data = await getCachedData(`${key}${query}`);

        if(!data) return next();

        console.log("beyond next");
        response.status(200).json({
            success: true,
            data
        });
    }
}

export default checkCache;