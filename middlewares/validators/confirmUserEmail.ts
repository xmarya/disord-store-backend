import confirmEmail from "@services/auth/credentials/confirmEmail";
import { catchAsync } from "@utils/catchAsync";
import returnError from "@utils/returnError";

const confirmUserEmail = catchAsync(async (request, response, next) => {
  console.log("confirmUserEmail");
  const { randomToken } = request.params;
  const result = await confirmEmail(randomToken);

  if(!result.ok) return next(returnError(result));

  response.status(203).json({
    success: true,
    message: result.result,
  });
});

export default confirmUserEmail;
