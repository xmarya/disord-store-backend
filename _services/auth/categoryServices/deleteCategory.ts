import Category from "@models/categoryModel";
import { deleteDoc } from "@repositories/global";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function deleteCategory(categoryId:MongoId) {

    const safeDelete= safeThrowable(
        () => deleteDoc(Category, categoryId),
        (error) => new Failure((error as Error).message)
    );

    return await extractSafeThrowableResult(() => safeDelete);
}

export default deleteCategory;