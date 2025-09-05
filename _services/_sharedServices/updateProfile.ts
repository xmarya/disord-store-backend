import eventBus from "@config/EventBus";
import updateAdminProfile from "@services/auth/adminServices/adminAuth/updateAdminProfile";
import updateUserProfile from "@services/auth/usersServices/updateUserProfile";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { BaseUserData } from "@Types/Schema/Users/BasicUserTypes";
import { NotAssistant } from "@Types/Schema/Users/NotAssistant";

async function updateProfile(user: NotAssistant, updatedData: Partial<BaseUserData>) {
  const { userType, id } = user;
  const { firstName, lastName } = updatedData;

  if (firstName?.trim() === "" || lastName?.trim() === "") return new BadRequest("الرجاء تعبئة حقول الاسم بالكامل");

  let result;
  switch (userType) {
    case "admin":
      result = await updateAdminProfile(id, updatedData);
      break;
    case "user":
    case "storeOwner":
      result = await updateUserProfile(id, updatedData);
      break;
  }

  if (!result.ok) return result;

  const { result: updatedProfile } = result;
  const event: UserUpdatedEvent = {
    type: "user.updated",
    payload: { user: updatedProfile },
    occurredAt: new Date(),
  };

  eventBus.publish(event);
  return result;
}

export default updateProfile;
