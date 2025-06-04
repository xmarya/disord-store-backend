/* OLD CODE (kept for reference): 
export async function createCategory(data: CategoryBasic) {
  //STEP 1) check if the store exists:
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
import { CategoryDocument } from "../../_Types/Category";
import { MongoId } from "../../_Types/MongoId";


export async function assignProductToCategory<T extends CategoryDocument>(Model:mongoose.Model<T>,categories:Array<T>, productId:MongoId) {
  console.log("assignProductToCategory");
  await Model.updateMany({_id: {$in: categories}}, {$addToSet: { products: productId }});
}

// NOTE: this is going to be called in two scenarios: 1) removing a category from the product. 2) deleting the product permanently.
export async function deleteProductFromCategory<T extends CategoryDocument>(Model:mongoose.Model<T>,categories:Array<T>, productId:MongoId) {
  console.log("deleteProductFromCategory");
  await Model.updateMany({_id: {$in: categories}}, {$pull: { products: productId }});
}