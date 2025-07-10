/* OLD CODE (kept for reference): 
export async function createCategory(data: CategoryBasic) {
  // 1) check if the store exists:
  const store = await Store.findById(data.store);
  if (!store) return new AppError(400, "لا يوجد متجر بهذا المعرف");
  
  console.log(data);
  const session = await startSession();
  session.startTransaction();
  
  try {
    const newCategory = await Category.create([data], { session });
    
    await Store.findByIdAndUpdate(store, { $addToSet: { categories: newCategory[0].id } });
    
    await session.commitTransaction();
    return newCategory;
  } catch (error) {
    await session.abortTransaction();
    const message = (error as AppError).message || "لم تتم العملية بنجاح. حاول مجددًا"
    throw new AppError(500, message);
  } finally {
    await session.endSession();
  }
}
*/

import mongoose from "mongoose";
import { CategoryBasic } from "../../_Types/Category";
import { MongoId } from "../../_Types/MongoId";
import Category from "../../models/categoryModel";

export async function getAllProductCategories(productId:MongoId):Promise<CategoryBasic[]> {
  const categories = await Category.find({products: productId}, "name colour createdBy updatedBy");
  console.log("getAllProductCategories", categories);

  return categories;
}

/* OLD CODE (kept for reference): 
export async function assignProductToCategory(categories:Array<CategoryBasic>, productId:MongoId) {
  await Category.updateMany({_id: {$in: categories}}, {$addToSet: { products: productId }});
}
*/

export async function updateProductInCategories(categories:Array<CategoryBasic>, productId:MongoId) {
    const operations = [];
    // STEP 1) Add productId to provided categories (addToSet)
  operations.push({
    updateMany: {
      filter: { _id: { $in: categories } },
      update: { $addToSet: { products: productId } }
    }
  });

  // STEP 2) Remove productId from categories NOT in the list but that contain the productId (pull)
  operations.push({
    updateMany: {
      filter: {
        _id: { $nin: categories },
        products: productId
      },
      update: { $pull: { products: productId } }
    }
  });

  await Category.bulkWrite(operations);
}

// NOTE: this is going to be called when deleting a product permanently.
export async function deleteProductFromCategory(categories:Array<CategoryBasic>, productId:MongoId, session:mongoose.ClientSession) {
  console.log("deleteProductFromCategory");
  await Category.updateMany({_id: {$in: categories}}, {$pull: { products: productId }}).session(session);
  // get all the cats that have this product id,
  // remove the one that is not in the new cats array
  // await Category.find({products: "684ac7b49e4ba6351f4fa89d"});
}

export async function deleteAllCategories(storeId:MongoId, session:mongoose.ClientSession){
  await Category.deleteMany({store: storeId}).session(session);
}