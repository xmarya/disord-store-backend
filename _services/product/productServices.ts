import mongoose from "mongoose";
import { MongoId } from "../../_Types/MongoId";
import { ProductDocument } from "../../_Types/Product";
import Product from "../../models/productNewModel";

export async function updateProduct(storeId:MongoId, productId: MongoId, data: ProductDocument) { /*✅*/
  console.log("updateProduct");
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
    { _id: productId, store:storeId },
    {
      $set: {
        ...data,
      },
      /* OLD CODE (kept for reference): 
      ...addToSetStage
      */
    },
    { runValidators: true, new:true} // ensures validation still runs
  );

  return updatedProduct;
}

/* TRANSLATE: the categories must exactly match what's sent in the request.body. 
so, to overwrite the existing array, $set should be used instead of $addToSet; since the later only add 
a category if not exist, it doesn't remove any removed category */

export async function deleteAllProducts(storeId:MongoId, session:mongoose.ClientSession){
  await Product.deleteMany({store:storeId}).session(session)
}