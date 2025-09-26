import { deleteProductFromCategory } from "@repositories/category/categoryRepo";
import { ProductDeletedEvent } from "@Types/events/ProductEvents";
import { Failure } from "@Types/ResultTypes/errors/Failure";
import { Success } from "@Types/ResultTypes/Success";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import safeThrowable from "@utils/safeThrowable";


async function deleteProductFromCategoriesConsumer(event:ProductDeletedEvent){
    const {categories, productId} = event.payload;

    const safeDeleteProduct = safeThrowable(
        () => deleteProductFromCategory(categories, productId),
        (error) => new Failure((error as Error).message)
    );

    const deleteProductResult = await extractSafeThrowableResult(() => safeDeleteProduct);

    if(!deleteProductResult.ok) return new Failure(deleteProductResult.message, {serviceName:"categoriesCollection", ack:false});

    return new Success({serviceName:"categoriesCollection", ack:true});
}

export default deleteProductFromCategoriesConsumer;