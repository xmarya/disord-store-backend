import crypto from "crypto";
import mongoose from "mongoose";
import bullmq from "@config/bullmq";
import { ms } from "../../../_constants/primitives";
import { AdminDocument } from "@Types/admin/AdminUser";
import { UserDocument } from "@Types/User";
import { getAllCachedData } from "../../redis/cacheControllers/globalCache";
import { confirmUserEmail } from "@repositories/user/userRepo";
import { confirmAdminEmail } from "@repositories/admin/adminRepo";

const { queue } = await bullmq("EmailConfirm", confirmEmailProcessor);

async function confirmEmailBullMQ() {
  await queue.add("dbUpdateBatch", {}, { repeat: { every: 15000 }, jobId: "email-batch-writer" });
}

async function confirmEmailProcessor() {
  // STEP 1) get lists of data ids stored in the cache
  const emailsToBeConfirmed = await getAllCachedData<{ Model: "User" | "Admin"; id: string; randomToken: string }>("EmailConfirm");
  const filteredData = emailsToBeConfirmed.filter(Boolean);

  if (!filteredData.length) return;

  const userModelOperations = [];
  const adminModelOperations = [];

  const User = mongoose.model("User");
  const Admin = mongoose.model("Admin");

  for (const { Model, id, randomToken } of filteredData) {
    // get the corresponding individual data (userId, Model, randomToken)
    const ModelRef = Model === "User" ? User : Admin;
    const hashedToken = crypto.createHash("sha256").update(randomToken).digest("hex");
    const user: UserDocument | AdminDocument = await ModelRef.findOne({
      _id: id,
      "credentials.emailConfirmationToken": hashedToken,
    }).select("credentials");

    if (!user) continue; // skip to the next iteration if the user is null
    // db update
    const bulkOps = {
      updateOne: {
        filter: { _id: user._id },
        update: {
          $unset: {
            "credentials.emailConfirmationToken": "",
            "credentials.emailConfirmationExpires": "",
          },
          $set: {
            "credentials.emailConfirmed": true,
          },
        },
      },
    };
    Model === "User" ? userModelOperations.push(bulkOps) : adminModelOperations.push(bulkOps);
  }

  userModelOperations.length && confirmUserEmail(userModelOperations).catch(console.error);
  adminModelOperations.length && confirmAdminEmail(adminModelOperations).catch(console.error);
}

export default confirmEmailBullMQ;
