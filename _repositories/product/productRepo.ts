import { MongoId } from "@Types/Schema/MongoId";
import { ProductDocument } from "@Types/Schema/Product";
import Product from "@models/productModel";

export async function updateProduct(storeId: MongoId, productId: MongoId, data: Partial<ProductDocument>) {
  /*✅*/
  /* OLD CODE (kept for reference): 
  let addToSetStage = {};
  
  if("categories" in data) {
    const categories = data.categories;
    delete (data as any).categories;
    
    addToSetStage = {
      $addToSet: {
        categories: { $each: categories },
      }
    }
  }
  */

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId, store: storeId },
    {
      $set: {
        ...data,
      },
      /* OLD CODE (kept for reference): 
      ...addToSetStage
      */
    },
    { runValidators: true, new: true } // ensures validation still runs
  ).populate({ path: "categories", select: "name colour createdBy updatedBy" });

  return updatedProduct;
}

/* TRANSLATE: the categories must exactly match what's sent in the request.body. 
so, to overwrite the existing array, $set should be used instead of $addToSet; since the later only add 
a category if not exist, it doesn't remove any removed category */

export async function deleteAllProducts(storeId: MongoId) {
  return await Product.deleteMany({ store: storeId });
}
