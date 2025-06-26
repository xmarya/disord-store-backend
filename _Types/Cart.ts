import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export interface CartDataBody {
  user: MongoId;
  productsPerStore: Array<{
    store: MongoId;
    products: Array<{
      productId: MongoId;
      name: string;
      image: string;
      quantity: number;
      productType: "physical" | "digital";
      price: number; // per one (quantity = 1)
      discount?: number; // if there is a discount is applied on this product (per quantity)
      discountedPrice?: number; // this is depending on the existence of the discount
      weight?: number;
      taxAmount: number;
      priceWithTax:number,
    }>;
    countOfStoreProducts:number, // sum of each product's quantity
    totalBeforeDiscount: number; // sum of (price * quantity)
    totalAfterDiscount: number; // sum of discountedPrice
    totalWeight?: number;
    appliedCoupon?:string
    total: number; // sum of all products' priceWithTax
  }>;
  countOfCartProducts:number,
  totalOfDiscounts:number, // grand discount (sum of all `totalAfterDiscount` from each store),
  cartTotalWight?:number,
  cartTotal: number; // grand total (sum of all `totalWithTax` from each store)
}

// export interface Cart extends CartDataBody {
//   // cartTotal: number; // grand total (sum of all `totalWithTax` from each store)
// }

export type CartDocument = CartDataBody & mongoose.Document;
