import { ProductBasic, ProductDocument } from "../../_Types/Product";
import Product from "../../models/productModel";
import { MongoId } from "../../_Types/MongoId";

//TODO: delete the two below ONLY.

export async function createProduct(data: ProductBasic) {
  const newProd = await Product.create(data);
  return newProd;
}

export async function getAllProducts(storeId:MongoId) {
  const products = await Product.find({ store: storeId });

  return products;
}

export async function updateProduct(productId: string, data: ProductDocument) {
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
  const updatedProduct = await Product.updateOne(
    { _id: productId },
    {
      $set: {
        ...data,
      },
      /* OLD CODE (kept for reference): 
      ...addToSetStage
      */
    },
    { runValidators: true} // ensures validation still runs
  );

  return updatedProduct;
}

/* TRANSLATE: the categories must exactly match what's sent in the request.body. 
so, to overwrite the existing array, $set should be used instead of $addToSet; since the later only add 
a category if not exist, it doesn't remove any removed category */