import eventBus from "@config/EventBus";
import User from "@models/userModel";
import { getOneDocById } from "@repositories/global";
import { deleteRegularUser } from "@repositories/user/userRepo";
import { UserDeletedEvent } from "@Types/events/UserEvents";
import { err, ok } from "neverthrow";
import deleteStoreOwnerAndStore from "./storeOwnerServices/deleteStoreOwnerAndStore";

async function deleteUser(userId: string) {
  const user = await getOneDocById(User, userId, { select: ["userType", "myStore"] });

  if (!user) return err("no user with this id");
  if (user.userType === "storeAssistant") return err("this route is not for deleting a storeAssistant");

  if (user.userType === "storeOwner") await deleteStoreOwnerAndStore(userId, user.myStore);
  else await deleteRegularUser(userId);

  const event: UserDeletedEvent = {
    type: "user.deleted",
    payload: { userId },
    occurredAt: new Date(),
  };

  eventBus.publish(event);

  return ok("user deleted successfully");
}

export default deleteUser;
