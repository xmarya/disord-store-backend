import { createNewUser } from "../../../_services/user/userService";
import { UserDocument } from "../../../_Types/User";
import { catchAsync } from "../../../_utils/catchAsync";
import sanitisedData from "../../../_utils/sanitisedData";
import validateNewUserData from "../../../_utils/validators/validateNewUserData";

export const createUnlimitedUser = catchAsync(async (request, response, next) => {
  sanitisedData(request, next);
  const isValid = await validateNewUserData(request, next);
  if (!isValid) return;

  const data: UserDocument = { 
    userType: "storeOwner", subscribedPlanDetails: { planName: "unlimited", price: request.body.price }, 
    signMethod: "credentials", credentials: { ...request.body.password }, ...request.body };

  // STEP 1) create the user
  const newUser = await createNewUser(data);
  const {email, subscribedPlanDetails: {price}} = newUser;

  // STEP 2) send to the email with the price and the link of the invoice:
  const invoiceLink = "";
  response.status(201).json({
    success:true,
    email,
    price,
    invoiceLink
  });
});
