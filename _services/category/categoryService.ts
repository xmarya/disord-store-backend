import { startSession, Types } from "mongoose";
import { CategoryBasic } from "../../_Types/Category";
import { AppError } from "../../_utils/AppError";
import Category from "../../models/categoryModel";
import Store from "../../models/storeModel";

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

export async function getAllCategories(storeId:string | Types.ObjectId) {
  
    const categories = await Category.find({store:storeId});

    return categories;

}