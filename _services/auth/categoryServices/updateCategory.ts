import Category from "@models/categoryModel";
import { updateDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { CategoryBasic } from "@Types/Schema/Category";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreAssistantDocument } from "@Types/Schema/Users/StoreAssistant";
import { StoreOwnerDocument } from "@Types/Schema/Users/StoreOwner";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function updateCategory(data: CategoryBasic, categoryId: string, user: StoreOwnerDocument | StoreAssistantDocument, storeId: MongoId) {
  const { name } = data;
  const updatedBy = { name: `${user.firstName} ${user.lastName}`, id: user.id, date: new Date() };
  const safeUpdate = safeThrowable(
    () => updateDoc(Category, categoryId, { name, updatedBy }, { condition: { store: storeId } }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdate);
}

export default updateCategory;
