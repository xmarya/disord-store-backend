import Category from "@models/categoryModel";
import { createDoc } from "@repositories/global";
import { BadRequest } from "@Types/ResultTypes/errors/BadRequest";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { CategoryBasic } from "@Types/Schema/Category";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function createNewCategory(data: CategoryBasic, user: StoreOwnerDocument | StoreAssistantDocument, storeId: MongoId) {
  const { name } = data;
  if (!name?.trim()) return new BadRequest("Please add a name to the category");

  const userName = `${user.firstName} ${user.lastName}`;
  const userId = user.id;
  const createdBy = { name: userName, id: userId };
  const newCat = { name, createdBy, store: storeId };
  const safeCreate = safeThrowable(
    () => createDoc(Category, newCat),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeCreate);
}

export default createNewCategory;
