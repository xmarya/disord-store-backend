import type { Request, Response, NextFunction } from "express";
import { getCachedData } from "./globalCache";

type CacheKeys = "Product:query" | "Store:query" | "Products:store";

function buildCacheKey(cacheKey: CacheKeys, request: Request): string {
  // let key = `${cacheKey.split(":")[0]}`
  // alternative 👇🏻 which keeps the :
  let firstPart = `${cacheKey.slice(0, cacheKey.indexOf(":") + 1)}`;
  const query = JSON.stringify(request.query);
  const params = Object.values(request.params)[0];
  const secondPart = cacheKey.includes("query") ? query : params;

  return `${firstPart}${secondPart}`;
}

const checkCache = (cacheKey: CacheKeys) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const key = buildCacheKey(cacheKey, request);
    const data = await getCachedData(key);

    if (!data) return next();

    response.status(200).json({
      success: true,
      data,
    });
  };
};

export default checkCache;
