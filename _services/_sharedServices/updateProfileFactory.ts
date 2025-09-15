import eventBus from "@config/EventBus";
import updateAdminProfile from "@services/auth/adminServices/adminAuth/updateAdminProfile";
import updateStoreOwnerProfile from "@services/auth/storeOwnerServices/updateStoreOwnerProfile";
import updateUserProfile from "@services/auth/usersServices/updateUserProfile";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { BaseUserData } from "@Types/Schema/Users/BasicUserTypes";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";
import mongoose from "mongoose";

async function updateProfileFactory(user: NotAssistant, updatedData: Partial<BaseUserData>, session?: mongoose.ClientSession) {
  const { userType, id } = user;
  const { firstName, lastName } = updatedData;

  if (firstName?.trim() === "" || lastName?.trim() === "") return new BadRequest("الرجاء تعبئة حقول الاسم بالكامل");

  let result;
  switch (userType) {
    case "admin":
      result = await updateAdminProfile(id, updatedData, session);
      break;
    case "storeOwner":
      result = await updateStoreOwnerProfile(id, updatedData, session);
      break;
    default:
      result = await updateUserProfile(id, updatedData, session);
  }

  if (!result.ok) return result;

  const { result: updatedProfile } = result;
  const event: UserUpdatedEvent = {
    type: "user-updated",
    payload: { user: updatedProfile },
    occurredAt: new Date(),
  };

  eventBus.publish(event);
  return result;
}

export default updateProfileFactory;
