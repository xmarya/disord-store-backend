import mongoose from "mongoose";
import { CategoryBasic } from "@Types/Schema/Category";
import { MongoId } from "@Types/Schema/MongoId";
import Category from "@models/categoryModel";

export async function getAllProductCategories(productId: MongoId) {
  const categories = await Category.find({ products: productId }, "name colour createdBy updatedBy");

  return categories;
}

/* OLD CODE (kept for reference): 
export async function assignProductToCategory(categories:Array<CategoryBasic>, productId:MongoId) {
  await Category.updateMany({_id: {$in: categories}}, {$addToSet: { products: productId }});
}
*/

export async function updateProductInCategories(categories: Array<MongoId>, productId: MongoId) {
  const operations = [];
  // STEP 1) Add productId to provided categories (addToSet)
  operations.push({
    updateMany: {
      filter: { _id: { $in: categories } },
      update: { $addToSet: { products: productId } },
    },
  });

  // STEP 2) Remove productId from categories NOT in the list but that contain the productId (pull)
  operations.push({
    updateMany: {
      filter: {
        _id: { $nin: categories },
        products: productId,
      },
      update: { $pull: { products: productId } },
    },
  });

  return await Category.bulkWrite(operations);
}

// NOTE: this is going to be called when deleting a product permanently.
export async function deleteProductFromCategory(categories: Array<MongoId>, productId: MongoId) {
  await Category.updateMany({ _id: { $in: categories } }, { $pull: { products: productId } });
  // get all the cats that have this product id,
  // remove the one that is not in the new cats array
  // await Category.find({products: "684ac7b49e4ba6351f4fa89d"});
}

export async function deleteAllCategories(storeId: MongoId, session: mongoose.ClientSession) {
  return await Category.deleteMany({ store: storeId }).session(session);
}
