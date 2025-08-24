import getAdminCredentials from "@services/adminServices/getAdminCredentials";
import getUserCredentials from "@services/usersServices/getUserCredentials";
import { AdminDocument } from "@Types/admin/AdminUser";
import { UserDocument } from "@Types/User";
import jwtSignature from "@utils/jwtToken/generateSignature";
import { comparePasswords } from "@utils/passwords/comparePasswords";
import { err } from "neverthrow";

type ChangedPasswordData = {
  user: UserDocument | AdminDocument;
  currentPassword: string;
  newPassword: string;
};
async function confirmChangedPassword(data: ChangedPasswordData) {
  const { userType, id } = data.user;

  let result;
  switch (userType) {
    case "admin":
      result = await getAdminCredentials(id);
      break;

    default:
      result = await getUserCredentials(id);
      break;
  }

  if (!result.ok) return result;

  const {result: user} = result;
  //STEP 3) is the provided password matching our record?
  if (!(await comparePasswords(data.currentPassword, user.credentials.password))) return err("الرجاء التحقق من البيانات المدخلة");

  //STEP 4) allow changing the password:
  user.credentials.password = data.newPassword;
  await user.save();

  // STEP 5) generate a new token:
  return jwtSignature(user.id, "1h");
}

export default confirmChangedPassword;
