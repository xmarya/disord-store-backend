import eventBus from "@config/EventBus";
import updateAdminProfile from "@services/auth/adminServices/adminAuth/updateAdminProfile";
import updateUserProfile from "@services/auth/usersServices/updateUserProfile";
import { AdminDocument } from "@Types/admin/AdminUser";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { UserDocument } from "@Types/User";

async function updateProfile(user: UserDocument | AdminDocument, updatedData: Partial<UserDocument> | Partial<AdminDocument>) {
  const { userType, id } = user;
  const { firstName, lastName } = updatedData;

  if (firstName?.trim() === "" || lastName?.trim() === "") return new BadRequest("الرجاء تعبئة حقول الاسم بالكامل");

  let result;
  switch (userType) {
    case "admin":
      result = await updateAdminProfile(id, updatedData as Partial<AdminDocument>);
      break;

    default:
      result = await updateUserProfile(id, updatedData as Partial<UserDocument>);
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
