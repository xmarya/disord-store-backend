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
      unitPrice: number;
      discount?: number; // if there is a discount is applied on this product (per quantity)
      discountedPrice?: number; // this is depending on the existence of the discount
      weight?: number;
    }>;
    countOfStoreProducts: number; // sum of each product's quantity
    totalBeforeDiscount: number; // sum of (price * quantity)
    totalAfterDiscount: number; // sum of discountedPrice
    totalWeight?: number;
    appliedCoupon?: string;
    total: number; 
  }>;
  countOfCartProducts: number;
  totalOfDiscounts: number; // grand discount (sum of all `totalAfterDiscount` from each store),
  cartTotalWight?: number;
  shippingFees?: number;
  cartTotal: number; // grand total (sum of all `total` from each store and shippingFees)
}


export type CartDocument = CartDataBody & mongoose.Document;
