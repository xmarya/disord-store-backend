import Admin from "../../models/adminModel";


export async function confirmAdminEmail(bulkOps: any) {
      await Admin.bulkWrite(bulkOps);
}