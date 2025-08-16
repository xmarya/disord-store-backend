import eventBus from "@config/EventBus";
import { UserCreatedEvent } from "@Types/events/UserEvents";
import novuSendWelcome from "../../externals/novu/workflowTriggers/welcomeEmail";

eventBus.ofType<UserCreatedEvent>("user.created").subscribe(async (event) => {
  try {
    const user = event.payload.user;
    const confirmUrl = event.payload.confirmUrl;
    const { userType } = user;
    const workflowId = userType === "storeOwner" ? "welcome-store-owner" : "welcome-general";
    await novuSendWelcome(workflowId, user, confirmUrl);
  } catch (error) {
    console.log("error?", error);
  }
});
