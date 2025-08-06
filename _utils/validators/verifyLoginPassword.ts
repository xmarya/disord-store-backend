import { getOneDocByFindOne } from "../../_services/global";
import { CredentialsLoginDataBody } from "../../_Types/UserCredentials";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";
import { comparePasswords } from "../passwords/comparePasswords";
import User from "../../models/userModel";
import Admin from "../../models/adminModel";

const verifyLoginPassword = (loginUser: "user" | "admin") =>
  catchAsync(async (request, response, next) => {
    const { password }: CredentialsLoginDataBody = request.body;
    const Model = loginUser === "user" ? User : Admin;
    const select: any = ["credentials", "email", "firstName", "lastName", "userType", "image", "phoneNumber", "myStore", "subscribedPlanDetails"];

    const user = await getOneDocByFindOne(Model, {
      condition: request.loginMethod,
      select,
    });
    if (!user) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

    // STEP 2) checking the password:
    if (!(await comparePasswords(password, user.credentials.password))) return next(new AppError(401, "الرجاء التحقق من البيانات المدخلة"));

    const plainUser = user.toObject();
    delete plainUser.credentials.password;
    request.user = plainUser;

    next();
  });

export default verifyLoginPassword;
