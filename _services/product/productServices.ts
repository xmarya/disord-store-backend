import mongoose, { Types } from "mongoose";
import { ProductBasic, ProductDocument } from "../../_Types/Product";
import Product from "../../models/productModel";

//TODO: delete the two below ONLY.

export async function createProduct(data: ProductBasic) {
  const newProd = await Product.create(data);
  return newProd;
}

export async function getAllProducts(storeId: string | Types.ObjectId) {
  const products = await Product.find({ store: storeId });

  return products;
}

export async function updateProduct<T extends mongoose.Document>(Model: mongoose.Model<T>, productId: string, data: any) {
  console.log("updateProduct");
  const categories = data.categories;
  delete data.categories;
  const updatedProduct = await Model.updateOne(
    { _id: productId },
    {
      $set: {
        ...data,
      },
      $addToSet: {
        categories: { $each: categories },
      },
    },
    { runValidators: true} // ensures validation still runs
  );

  return updatedProduct;
}
export async function getProductsByCategory() {} // TODO
