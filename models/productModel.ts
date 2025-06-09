import mongoose, { Schema } from "mongoose";
import { ProductDocument } from "../_Types/Product";

type ProductModel = mongoose.Model<ProductDocument>;

export const productSchema = new Schema<ProductDocument>(
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
    categories: [{
      type: Schema.Types.ObjectId,
      ref:"Category"
    }],
    description: {
      type: String,
      required: [true, "the description field is required"],
    },
    // status: {
    //   type: String,
    //   enum: ["inStock", "outOfStock"],
    //   required: [true, "the productStatus is required"],
    // },
    stock: {
      type: Number,
      required: false,
      default: null,
      min: [0, "Stock cannot be negative"],
    },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    productType: {
      type: String,
      enum: ["physical", "digital"],
      default: "physical",
      required: true,
    },
    // discount: {
    //   // NOTE: the user insert the number to be in %
    //   type: Number,
    // },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "each product must belong to a store"],
    },
    numberOfPurchases: {
      //TODO: this counter should be increased once the users completed their payment process
      type: Number,
      default: 0,
    },
    ranking: {
      type: Number,
      default: null,
      // NOTE: this filed will be used to presents the ranking of store's products, it's irrelevant to the storeStats model.
    },
    ratingsAverage: {
      type: Number,
      default: null,
      min: [1, "rating must be 1 to 5"],
      max: [5, "rating must be 1 to 5"],
      set: (rating: number) => Math.round(rating * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    weight: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
/* OLD CODE (kept for reference): 
productSchema.pre("save", async function (this:ProductDocument, next) {
if (this.isModified("categories")) {
  console.log("productSchema.pre(save)");
  const modelName = (this.constructor as Model<ProductDocument>).modelName;
  const [_, modelId] = modelName.split("-");
  // if a product has been associated with a category, assert its id to the category:
  console.log("this.constructor.modelName", modelId);
  await mongoose.model(`Category-${modelId}`).findByIdAndUpdate(this.categories, { $addToSet: { products: this.id } });
}
next();
});
*/

/* OLD CODE (kept for reference): 
productSchema.pre("findOneAndDelete", async function (next) { 
  console.log("productSchema.pre(findOneAndDelete)");
  const doc = await this.model.findOne(this.getQuery()).select("categories");
  const categories = doc.categories;
  
  if (!doc) return next();
  const [_, modelId] = this.model.name.split("-");
  await mongoose.model(`Category-${modelId}`).updateMany({ id: { $in: categories } }, { $pull: { products: doc.id } });
  
  next();
});
*/

// the below hooks teach the Product model how to manage its own category relationships automatically
/* OLD CODE (kept for reference): 
productSchema.pre("save", async function (this: ProductDocument, next) {
  if (!this.isModified("categories")) return next();
  console.log("productSchema.pre(save)");
  
  const product = this;
  const newCategory = product.categories;
  if (newCategory.length) {
    const [_, modelId] = (product.constructor as mongoose.Model<ProductDocument>).modelName.split("-");
    const CategoryModel = await getDynamicModel("Category", modelId);
    
    await CategoryModel.updateMany({ _id: { $in: newCategory } }, { $addToSet: { products: product._id } });
  }
  next();
});

*/
/* OLD CODE (kept for reference): 
productSchema.pre("findOneAndUpdate", async function(next) {
  console.log("productSchema.pre(findOneAndUpdate)");

  const updatedFields = this.getUpdate();
  if(!updatedFields?.categories) return next();

  const productId = this.getQuery()._id;
  const productDoc = await this.model.findById(productId).select('categories');
  if (!productDoc) return next(); // new document, no merging needed

  // const existingCategories = productDoc.categories.map(id => id.toString());
  // console.log("existingCategories", existingCategories);
  // const incomingCategories = (updatedFields?.categories || []).map(id => id.toString());
  // console.log("incomingCategories", incomingCategories);
  
  // // Merge without duplicates
  // const mergedCategories = Array.from(new Set([...existingCategories, ...incomingCategories]));
  
  // // Assign back merged array
  // productDoc.categories = mergedCategories;
  
  // productDoc.markModified('categories');
  
  console.log("productDoc.categories = mergedCategories;", productDoc);
  const [_, modelId] = this.model.modelName.split("-");
  const CategoryModel = await getDynamicModel('Category', modelId);
  // Add the category reference to the product
  // if (existingProduct?.categories.length) {
    //   await CategoryModel.updateMany(
      //     { _id: { $in: existingProduct.categories } },
      //     { $pull: { products: productId } }
      //   );
      // }
      
      // Add the product reference to the categories
      if (updatedFields?.categories.length) {
        await CategoryModel.updateMany(
          { _id: { $in: updatedFields?.categories } },
          { $addToSet: { products: productId } }
        );
      }
      next();
    });
    */

productSchema.index({name: 1, store:1}, {unique:true}); // ensure uniqueness for the products' names in each store
productSchema.index({ ranking: 1 });

//TODO: delete these after fully refactoring everything
const Product = mongoose.model<ProductDocument, ProductModel>("Product", productSchema);

export default Product;
