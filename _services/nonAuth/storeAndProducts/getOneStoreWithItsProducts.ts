import { MongoId } from "@Types/MongoId";
import { QueryParams } from "@Types/Request";
import getOneStoreForPublic from "./getOneStoreForPublic";
import getAllProductsForPublic from "./getAllProductsForPublic";
import { StoreDocument } from "@Types/Store";
import { ProductDocument } from "@Types/Product";
import { err } from "neverthrow";

/*REQUIRES TESTING IN THESE SCENARIOS:
    1- wrong storeId
    2- store exist, no products
*/

async function getOneStoreWithItsProducts(storeId: MongoId, query: QueryParams) {
  const [storesResult, productsResult] = await Promise.all([
    getOneStoreForPublic(storeId), 
    getAllProductsForPublic(query, storeId)
]);

  if (!storesResult.ok) return err("لا يوجد متجر بهذا المعرف");

  let products: ProductDocument[] = [];
  if (productsResult.ok) products = productsResult.result;

  const store = storesResult.result;

  return { ok: true, result: { store, products } };
}

export default getOneStoreWithItsProducts;
