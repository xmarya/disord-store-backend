import { CategoryDocument } from "@Types/Category";
import mongoose, { Schema } from "mongoose";
import Product from "./productModel";

type CategoryModel = mongoose.Model<CategoryDocument>;
export const categorySchema = new Schema<CategoryDocument>({
  name: {
    type: String,
    required: [true, "the category name is required"],
    unique: true,
  },
  colour: {
    type: String,
    required: [true, "the category colour is required"],
  },
  createdBy: {
    name: String,
    id: Schema.Types.ObjectId,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  updatedBy: {
    name: String,
    id: Schema.Types.ObjectId,
    date: Date,
  },
  store: Schema.Types.ObjectId,
  products: [Schema.Types.ObjectId],
});

/* OLD CODE (kept for reference): 
categorySchema.pre("findOneAndDelete", async function (next) {
  console.log("categorySchema.pre(findOneAndDelete)");
  // STEP 1) execute an explicit query for the document tt get the store nad the products
  // (because this is a QUERY hook, there is no direct access to the schema properties)
  const [_, modelId] = this.model.modelName.split("-");
  const doc = await this.model.findOne(this.getQuery()).select("products");
  // const storeId = doc.store;
  const products = doc.products;
  
  if (!doc) return next();
  
  //STEP 2) getting the store/products and removing the deleted category form them concurrently:
  // Promise.all([await Store.findByIdAndUpdate(storeId, { $pull: { categories: doc.id } }), await Product.updateMany({ id: { $in: products } }, { $pull: { categories: doc.id } })]);
  await mongoose.model(`Product-${modelId}`).updateMany({ id: { $in: products } }, { $pull: { categories: doc.id } });
  
  next();
});
*/
categorySchema.index({ name: 1, store: 1 }, { unique: true }); /*✅*/
/* categorySchema.index({ name: 1, products: 1 }, { unique: true });  doesn't work with arrays */

// this post(findOneAndDelete) is one a category document is deleted
categorySchema.post("findOneAndDelete", async function (deletedDoc) {
  if (deletedDoc) {
    // await Promise.all([
    // Store.findByIdAndUpdate({ _id: deletedDoc.store }, { $pull: { categories: deletedDoc._id } }),
    await Product.updateMany({ _id: { $in: deletedDoc.products } }, { $pull: { categories: deletedDoc._id } }); /*✅*/
    // ]);
  }
});
const Category = mongoose.model<CategoryDocument, CategoryModel>("Category", categorySchema);

export default Category;
