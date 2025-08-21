import eventBus from "@config/EventBus";
import Admin from "@models/adminModel";
import { updateDoc } from "@repositories/global";
import { AdminDocument } from "@Types/admin/AdminUser";
import { UserUpdatedEvent } from "@Types/events/UserEvents";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import { err } from "neverthrow";

async function updateAdmin(adminId: string, updatedData: Partial<AdminDocument>) {
  const { email, firstName, lastName, image, phoneNumber } = updatedData;

  //   if (email) {
  //     const isEmailExist = await getOneDocByFindOne(Admin, { condition: { email } }); /*✅*/

  //     if (isEmailExist) return next(new AppError(400, "لا يمكن استخدام هذا البريد الإلكتروني"));
  //   }

  if (firstName?.trim() === "" || lastName?.trim() === "") return err("الرجاء تعبئة حقول الاسم بالكامل");

  const safeUpdatedAdmin = safeThrowable(
    () => updateDoc(Admin, adminId, { email, firstName, lastName, image, phoneNumber }),
    () => new Error("something went wrong, please try again")
  );

  const updatedAdmin = await extractSafeThrowableResult(() => safeUpdatedAdmin);

  if (updatedAdmin.ok) {
    const event:UserUpdatedEvent = {
        type: "user.updated",
        payload: {user: updatedAdmin.result},
        occurredAt: new Date(),
    }

    eventBus.publish(event);
  }

  return updatedAdmin;
}

export default updateAdmin;
