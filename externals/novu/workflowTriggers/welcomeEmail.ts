import novu from "@config/novu";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";

async function novuSendWelcome(event: UserCreatedEvent) {
  console.log("📍novuSendWelcome");
  const { confirmUrl, user } = event.payload;
  const { _id, firstName, lastName, userType, email, phoneNumber} = user;
  const workflowId = userType === "admin" ? "welcome-admin" : userType === "storeOwner" ? "welcome-store-owner" : "welcome-general";
  try {
     await novu.trigger({
      workflowId,
      to: {
        subscriberId: _id as string,
        firstName,
        lastName,
        email,
        phone: phoneNumber ?? undefined,
        data: {
          userType,
        },
      },
      payload: {
        emailConfirmationToken: confirmUrl,
      },
    });


    return new Success({novu:true});
  } catch (error) {
    console.log("novu couldn't send welcome notification");
    console.log(error);
    return new Failure((error as Error).message, { novu: false });
  }
}

export default novuSendWelcome;
