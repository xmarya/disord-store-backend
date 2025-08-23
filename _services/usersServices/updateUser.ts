import eventBus from "@config/EventBus";
import User from "@models/userModel";
import { updateDoc } from "@repositories/global";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import { UserDocument } from "@Types/User";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { err } from "neverthrow";

//ENHANCE the return type
async function updateUser(userId: string, updatedData: Partial<UserDocument>) {
  updatedData?.userType && delete updatedData.userType;

  const { firstName, lastName, image } = updatedData;
  if (firstName?.trim() === "" || lastName?.trim() === "") return err("الرجاء تعبئة حقول الاسم بالكامل");

  const safeUpdateUser = safeThrowable(
    () => updateDoc(User, userId, { firstName, lastName, image }),
    () => new Error("حدث خطأ أثناء معالجة العملية. حاول مجددًا")
  );

  const extractedResult = await extractSafeThrowableResult<UserDocument>(() => safeUpdateUser);

  if (extractedResult.ok) {
    const event: UserUpdatedEvent = {
      type: "user.updated",
      payload: { user: extractedResult.result },
      occurredAt: new Date(),
    };

    eventBus.publish(event);
  }
  return extractedResult;
}

export default updateUser;
