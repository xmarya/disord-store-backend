import mongoose, { startSession } from "mongoose";
import User from "../../models/userModel";
import StoreAssistant from "../../models/storeAssistantModel";
import Store from "../../models/storeModel";
import { AppError } from "../../_utils/AppError";
import { AssistantRegisterData, StoreAssistantDocument } from "../../_Types/StoreAssistant";
import { MongoId } from "../../_Types/MongoId";

/*NOTE: Why I had to  use : user[0].id instead of user.id as usual?
    tha reason is because this is a service layer function, not the controller that always returns response,
    here TypeScrypt inferred the return type of the function based on this line => return assistant;
    hovering it it indicates that it returns an array of document, and this is driven by Model.create() query.
*/

export async function createAssistant(data: AssistantRegisterData) {
  console.log("create Assistant service");
  const { email, password, username, permissions, storeId } = data;
  const session = await startSession();
  session.startTransaction();

  try {
    //STEP ) check if the store is exist:
    const store = await Store.findById(storeId);
    if (!store) throw new AppError(400, "لايوجد متجر  بهذا المعرف");

    //STEP : create a new user with userType = assistant:
    const user = await User.create(
      [
        {
          signMethod: "credentials",
          userType: "storeAssistant",
          email,
          credentials: { password },
          username,
        },
      ],
      { session }
    );

    //STEP : create a new assistant:
    const assistant = await StoreAssistant.create(
      [
        {
          assistant: user[0].id,
          inStore: storeId,
          permissions,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    //STEP 3) insert assistant data in store without registering it to the session to
    //  reduce the number of operations inside the critical section
    // (since th transactions should be as short as possible):
    await Store.findByIdAndUpdate(storeId, { $addToSet: { storeAssistants: user[0].id } }); // it should have be linked to the user, not the assistant, it could have be also assistant[0].assistant

    return assistant;
  } catch (error) {
    await session.abortTransaction();
    const message = (error as AppError).message || "لم تتم العملية بنجاح. حاول مجددًا"
    throw new AppError(500, message);
  } finally {
    await session.endSession();
  }
}

/* OLD CODE (kept for reference):  
export async function getOneAssistant(assistantId: string):Promise<StoreAssistantDocument | null> {
  // NOTE: the assistantId here is not the document unique _id. it's the id from the User Model. 
  // so, in this case the quey should findOne({assistantId}) since the findById() only looking for the identical _id 
  
  // const assistants = await StoreAssistant.findById(assistantId);
  // const assistants = await StoreAssistant.findOne({assistantId});
  
  // return assistants;
}
*/

export async function deleteAssistant(storeId: MongoId, assistantId: string) {
  const session = await startSession();
  session.startTransaction();
  try {

    await Store.findByIdAndUpdate(storeId, {$pull: { storeAssistants: assistantId}}, {session});
    await User.findByIdAndDelete(assistantId, {session});
    await StoreAssistant.deleteOne({assistant: assistantId}, {session})
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    const message = (error as AppError).message || "لم تتم العملية بنجاح. حاول مجددًا"
    throw new AppError(500, message);
    
  } finally {
    await session.endSession();
  }
}

export async function getAssistantPermissions(storeId:MongoId, assistantId:string) {
    const assistant = await StoreAssistant.findOne({assistant: assistantId, inStore:storeId});

    return assistant;
}

export async function deleteAllAssistants(storeId: MongoId, session:mongoose.ClientSession) {
  console.log("deleteAllAssistants");
  //STEP 1) get all the assistants ids based on the storeId to delete them from assistants collection:
  const assistantsId = await StoreAssistant.find({inStore: storeId}).select("assistant"); // this is going to have the mongodb default _id and the assistant field
  if(!assistantsId) return;
  
  await StoreAssistant.deleteMany({inStore: storeId}).session(session);

  //STEP 2) delete them using the same assistants ids from users collection:
  const userIds = assistantsId.map(a => a.assistant); // to only extract the assistant filed that holds a reference to the User
  await User.deleteMany({ _id: { $in: userIds }, userType: "storeAssistant" }).session(session);
}
