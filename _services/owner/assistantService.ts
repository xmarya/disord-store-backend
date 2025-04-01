import type { Request } from "express";
import { startSession } from "mongoose";
import User from "../../models/userModel";
import StoreAssistant from "../../models/storeAssistantModel";
import Store from "../../models/storeModel";
import { AppError } from "../../_utils/AppError";

/*NOTE: Why I had to  use : user[0].id instead of user.id as usual?
    tha reason is because tis is a service layer function, not the controller that always returns response,
    here TypeScrypt inferred the return type of the function based on this line => return assistant;
    hovering it it indicates that it returns an array of document, and this is driven by Model.create() query.
*/

export async function createAssistant(request: Request) {
  console.log("create Assistant service");
  const { email, password, username, permissions } = request.body;
  const session = await startSession();
  session.startTransaction();

 try {
     //STEP 1: create a new user with userType = assistant:
  const user = await User.create({
    signMethod: "credentials",
    userType: "storeAssistant",
    email,
    credentials: { password },
    username,
  }, {session});

  //STEP 2: create a new assistant:
  const assistant = await StoreAssistant.create({
    assistant: user[0].id,
    inStore: request.user.myStore,
    permissions,
  }, {session});

  await session.commitTransaction();

  //STEP 3) insert assistant data in store without registering it to the session to reduce the number of operations
  //  inside the critical section (since th transactions should be as short as possible):
  await Store.findByIdAndUpdate(user[0].id, {$addToSet: {storeAssistants: assistant}});

  return assistant;

 } catch (error) {
    await session.abortTransaction();
    throw new AppError(500, "لم تتم العملية بنجاح. حاول مجددًا");

 } finally {
    await session.endSession();
 }

}

export async function getAllAssistants(storeId:string) {
  const assistants = await Store.findById(storeId).select("storeAssistants");

  return assistants;
}
export async function getOneAssistant(assistantId:string) {
  const assistants = await StoreAssistant.findById(assistantId);

  return assistants;
}

export async function deleteAssistant(id:string) {
  await StoreAssistant.findByIdAndDelete(id);
}

