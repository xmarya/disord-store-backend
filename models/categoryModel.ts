import { CategoryDocument } from "../_Types/Category";
import { Model, model, Schema } from "mongoose";
import Store from "./storeModel";
import Product from "./productModel";

type CategoryModel = Model<CategoryDocument>;
const categorySchema = new Schema<CategoryDocument>({
  name: {
    type: String,
    required: [true, "the category name is required"],
  },
  colour: {
    type: String,
    required: [true, "the category colour is required"],
  },
  createdBy: {
    username:{
      type: String,
      required: [true, "the category createdBy username is required"],
    },
    id: {
      type:Schema.Types.ObjectId,
      required: [true, "the category createdBy id is required"],
    }
  },
  store: Schema.Types.ObjectId,
  products: [Schema.Types.ObjectId],
});

categorySchema.pre("findOneAndDelete", async function (next) {
  console.log("categorySchema.pre(findOneAndDelete)");
  // STEP 1) execute an explicit query for the document tt get the store nad the products
  // (because this is a QUERY hook, there is no direct access to the schema properties)
  const doc = await this.model.findOne(this.getQuery()).select("store products");
  const storeId = doc.store;
  const products = doc.products;

  if (!doc) return next();

  //STEP 2) getting the store/products and removing the deleted category form them concurrently:
  Promise.all([await Store.findByIdAndUpdate(storeId, { $pull: { categories: doc.id } }), await Product.updateMany({ id: { $in: products } }, { $pull: { categories: doc.id } })]);

  next();
});

const Category = model<CategoryDocument, CategoryModel>("Category", categorySchema);

export default Category;
