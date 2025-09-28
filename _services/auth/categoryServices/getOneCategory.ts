import Category from "@models/categoryModel";
import { getOneDocByFindOne } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";

async function getOneCategory(categoryId: MongoId, storeId: MongoId) {
  // const category = await getOneDocById(Category, request.params.categoryId);
  // another way of doing it. it is not a duplicated step for hasAuthorisation middleware.
  // without this extra condition the user can use a categoryId of a different store and still can get it
  const safeGet = safeThrowable(
    () => getOneDocByFindOne(Category, { condition: { id: categoryId, store: storeId } }),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeGet);
}

export default getOneCategory;
