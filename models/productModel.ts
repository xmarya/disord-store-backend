import { Model, Schema, model } from "mongoose";
import { ProductDocument } from "../_Types/Product";
import Category from "./categoryModel";

type ProductModel = Model<ProductDocument>;

export const ProductSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, "the name field is required"],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "the price field is required"],
    },
    // quantity: {
    //   type: Number,
    //   required: [true, "the quantity field is required"],
    // },
    image: {
      type: [String],
      required: [true, "the image field is required"],
    },
    categories: [Schema.Types.ObjectId],
    description: {
      type: String,
      required: [true, "the description field is required"],
    },
    // status: {
    //   type: String,
    //   enum: ["inStock", "outOfStock"],
    //   required: [true, "the productStatus is required"],
    // },
    stock: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    productType: {
      type: String,
      enum: ["physical", "digital"],
      default: "physical",
      required: true
    },
    // discount: {
    //   // NOTE: the user insert the number to be in %
    //   type: Number,
    // },
    // store: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Store",
    //   required: [true, "each product must belong to a store"],
    // },
    numberOfPurchases: {
      //TODO: this counter should be increased once the users completed their payment process
      type: Number,
      default: 0,
    },
    ranking: {
      type: Number,
      default: null
      // NOTE: this filed will be used to presents the ranking of store's products, it's irrelevant to the storeStats model.
    },
    ratingsAverage: {
      type: Number,
      default:null,
      min: [1, "rating must be 1 to 5"],
      max: [5, "rating must be 1 to 5"],
      set: (rating:number) => Math.round(rating * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default:0
    }
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.pre("save", async function (next) {
  if (this.isModified("categories")) {
    console.log("ProductSchema.pre(save)");
    // if a product has been associated with a category, assert its id to the category:
    await Category.findByIdAndUpdate(this.categories, { $addToSet: { products: this.id } });
  }
  next();
});

ProductSchema.pre("findOneAndDelete", async function (next) {
  console.log("ProductSchema.pre(findOneAndDelete)");
  const doc = await this.model.findOne(this.getQuery()).select("categories");
  const categories = doc.categories;

  if (!doc) return next();

  await Category.updateMany({ id: { $in: categories } }, { $pull: { products: doc.id } });

  next();
});

ProductSchema.index({ ranking: 1 });


//TODO: delete these after fully refactoring everything
const Product = model<ProductDocument, ProductModel>("Product", ProductSchema);

export default Product;
