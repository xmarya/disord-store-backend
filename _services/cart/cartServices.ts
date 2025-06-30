import { CartDataBody } from "../../_Types/Cart";
import Cart from "../../models/cartModel";

export async function addProductToCart(data: CartDataBody) {
  const { user, productsPerStore, countOfCartProducts, totalOfDiscounts, cartTotalWight, cartTotal } = data;
  await Cart.findOneAndUpdate(
    { user },
    {
      $set: {
        productsPerStore, countOfCartProducts, totalOfDiscounts, cartTotalWight, cartTotal
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}
