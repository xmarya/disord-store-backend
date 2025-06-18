import mongoose, { Schema } from "mongoose";
import { ProductDocument } from "../_Types/Product";
import { MongoId } from "../_Types/MongoId";

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

// this pre(/^find/) hook is for populating the categories:
productSchema.pre(/^find/, function(this: mongoose.Query<any, any>, next) {
  this.populate({path: "categories", select: "name colour"});
  next();
});

// this pre(validate) is to ensure the product-category pair uniqueness:
/* NOTE: 

  1- the validate hook's `this` keyword is for document by default.
    the reason I specifying it to be for query is because I want to access the new/updated value of the category.
    see:https://mongoosejs.com/docs/middleware.html#naming
  
  2- I had a bug where updatedFields?.categories was always undefined.
    so I tried to print the updatedFields only, it turned out the it had the categories indirectly inside '$set':
     '$set': {
    categories: [...],
    updatedAt: 2025-06-13T10:43:17.290Z
    }
    I figured out that it's because inside updateProduct service I'm updating the categories using aggregation pipeline.
    It's not like updating using the normal/usual way.
    so, I should've accessed the categories array through the key name "$set".

  3- I decided to comment out this hook because it made no sense for me having it while I'm
    updating the categories using $set which is going to replace THE WHOLE existing array with the new coming array.
    No need to worry about any duplication.
*/

/* OLD CODE (kept for reference):  
productSchema.pre("validate",{document:false, query:true}, async function(next) {
  const thisQuery = this as mongoose.Query<any,any>;
  const updatedFields = thisQuery.getUpdate() as mongoose.UpdateQuery<ProductDocument>;
  console.log("pre(validate)");
  
  const catsInQuery = updatedFields["$set"].categories as MongoId[];
  if(!catsInQuery) return next();
  console.log("updatedFields[\"$set\"].categories");
  
  const doc:ProductDocument = await thisQuery.model.findOne(thisQuery.getFilter()).select("categories");
  
  const catsInDocument:MongoId[] = doc.categories.map(cat => cat.id);
  console.log(catsInDocument);
  const isDuplicated = catsInQuery.some(catId => {
    console.log("some", catId);
    return catsInDocument.includes(catId.toString());
  });
  
  console.log("isDuplicated", isDuplicated);
  if(isDuplicated) {
    const error = new mongoose.Error.ValidationError();
    error.message = "validation failed. duplicated value of a category";
    return next(error);
  }
  
  next();
});

*/
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

// this post(deleteMany) hook is for deleting all of the product's rankings after deleting the store
// it's a query hook. see: https://mongoosejs.com/docs/middleware.html#naming
productSchema.post("deleteMany",{document:false, query:true} ,async function() {
  const deletedDocs = await this.model.find(this.getFilter()).select("_id");
  console.log("productSchema.post(deleteMany)", deletedDocs);

});

// const Product = mongoose.model<ProductDocument, ProductModel>("Product", productSchema);

// export default Product;
