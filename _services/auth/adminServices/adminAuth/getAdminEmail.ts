import Admin from "@models/adminModel";
import { isExist } from "@repositories/global";
import { MongoId } from "@Types/Schema/MongoId";

async function getAdminEmail(adminId: MongoId, email: string): Promise<boolean> {
  return await isExist(Admin, { email, id: { $ne: adminId } });
}

export default getAdminEmail;
