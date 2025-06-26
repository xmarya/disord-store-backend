import { CartDocument } from "../_Types/Cart";
import { Model, Schema, model } from "mongoose";

type CartModel = Model<CartDocument>;

const cartSchema = new Schema<CartDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ensure one cart per user
    },
    productsPerStore: [
      {
        storeId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "store id is required for the cart"],
        },
        products: [
          {
            productId: {
              type: Schema.Types.ObjectId,
              ref: "Product",
              required: [true, "product id is required for the cart"],
            },
            name: {
              type: String,
              required: [true, "product name is required for the cart"],
            },
            price: {
              type: Number,
              required: [true, "product price is required for the cart"],
            },
            productType: {
              type: String,
              enum: ["physical", "digital"],
              required: [true, "product type is required for the cart"],
            },
            image: {
              type: String,
              required: [true, "product price is required for the cart"],
            },
            quantity: {
              type: Number,
              required: true,
              min: 1,
              default: 1,
            },
            discount: Number,
            discountedPrice: Number,
            weight: Number,
          },
        ],
        countOfStoreProducts: Number,
        totalBeforeDiscount: Number, // sum of price only
        totalAfterDiscount: Number, // sum of discountedPrice only
        totalWeight: Number,
        appliedCoupon: String,
        total: Number, // sum of all products' priceWithTax
      },
    ],
    countOfCartProducts: Number,
    totalOfDiscounts: Number, // grand discount (sum of all `totalAfterDiscount` from each store)
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.index({ user: 1 }, { unique: true });

/* OLD CODE (kept for reference): 
// this virtual is the grand total (sum of all `totalWithTax` from each store)
cartSchema.virtual("cartTotal").get(function () {
  // NOTE: I decided to make the total a virtual files to prevent the staleness in case a product's price has changed
  // using this approach ig going to retrieve the VF total each time the users access their carts
  return this.productsPerStore.reduce((sum, store) => {
    return sum + store.total;
  }, 0);
});
*/

/* OLD CODE (kept for reference): 
// this pre(save, findOne) hook is for grouping the products in the cart by the store they belong to:
cartSchema.pre(["save","findOne"], async function(next) { //REQUIRES TESTING
const doc:CartDocument = await this.model.findOne(this.getFilter()).select("productsList");
if(!doc.productsList.length) return next();

const productsIds = doc.productsList.map(prod => prod.productId);
const products = await Product.find({_id: {$in: productsIds}}).select("store");

const groupedByStore = products.reduce((groups, currentProduct) => {
  const store = currentProduct.store;  //REQUIRES TESTING 
  console.log("what is the type and the value of the store???", store);
  
  if(!groups[store]) groups[store] = [];
  const {id:productId, name, image, price, productType} = currentProduct;
  groups[store].push({
    productId,
    name,
    productType,
    image,
    price,
    ...(currentProduct.productType === "physical" && {weight: currentProduct.weight} ),
    // quantity:??,
    // discount:??
    
  });
  return groups;
}, {});


next();
});
*/

const Cart = model<CartDocument, CartModel>("Cart", cartSchema);

export default Cart;
