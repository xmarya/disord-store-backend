import { getOneDocById } from "../../_services/global";
import Admin from "../../models/adminModel";
import User from "../../models/userModel";
import { AppError } from "../AppError";
import { catchAsync } from "../catchAsync";
import { generateRandomToken } from "../generateRandomToken";
import { createRedisHash } from "../redisOperations/redisHash";

export const sendConfirmationEmail = catchAsync(async (request, response, next) => {
  const { userType } = request.user;
  const query = ["user", "storeOwner"].includes(userType) ? getOneDocById(User, request.user.id, { select: ["credentials"] }) : getOneDocById(Admin, request.user.id, { select: ["credentials"] });

  const user = await query;

  if (!user) return next(new AppError(400, "انتهت المدة المسموحة للرابط"));

  const randomToken = await generateRandomToken(user, "emailConfirmation");
  // const uniqueEmailId = crypto.randomUUID();
  // NOTE: using a unique id prevents transaction emails to be threaded in the inbox,
  //  sending it within the request header tells that this email message is unique => https://youtu.be/FA2Axy_aKq8?si=t113reo4hNT0-jzN&t=193
  const confirmUrl = `${request.protocol}://${request.hostname}/api/v1/auth/confirmEmail/${randomToken}`;

  /* OLD CODE (kept for reference):  I decided to send emails from the Next.js router to make the most of Resend and Components
  // send to email
  //   const {data, error} = await new Resend(process.env.RESEND_KEY).emails.send({
    //     from:"",
    //     // to: [request.user.email],
    //     to: "shhmmanager1@gmail.com", // CHANGE LATER: to the actual user id after creating a real domain
    //     subject:"",
    //     html:""
    //   });
    */

  const key = `Email:${randomToken.slice(0, 12)}`;
  const data = {
    id: user.id,
    userType: request.user.userType,
  };

  await createRedisHash(key, data, "one-hour");

  response.status(200).json({
    success: true,
    confirmUrl,
  });
});
