import type { Application } from "express";
import {router as publicAuthRouter} from "@routers/nonAuth/publicAuthRoutes";
import {router as resourcesPublicRouter} from "@routers/nonAuth/publicResourcesRoutes";
import { router as dashboardRouter } from "@routers/dashboard";
import errorController from "controllers/errorController";

export default async function routerLoader(app:Application){
    app.use("/api/v1/public", resourcesPublicRouter);
    app.use("/api/v1/auth", publicAuthRouter);
    app.use("/api/v1/dashboard", dashboardRouter);
    app.use(errorController);
    /*
    app.use(((error, request, response, next) => {
      
      response.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    
    }) as ErrorRequestHandler); // ok
    
    */
}