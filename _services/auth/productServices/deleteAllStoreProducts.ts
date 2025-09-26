import { deleteAllProducts } from "@repositories/product/productRepo";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";
import mongoose from "mongoose";


async function deleteAllStoreProducts(storeId:MongoId, session:mongoose.ClientSession) {

    const safeDeleteAllProducts = safeThrowable(
        () => deleteAllProducts(storeId),
        (error) => new Failure((error as Error).message)
    );

    return extractSafeThrowableResult(() => safeDeleteAllProducts);
}

export default deleteAllStoreProducts