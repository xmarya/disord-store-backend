import { MongoId } from "./MongoId";

export interface Cart {
  user: MongoId;
  productsList: [
    {
      productId: MongoId;
      name: string;
      price: number;
      image: string;
      quantity: number;
      productType: "physical" | "digital"
      discount?: number;
      weight?:number
    }
  ];
  total: number;
  discountedPrice?:number
  totalWeight?:number
}

export type CartDocument = Cart;
