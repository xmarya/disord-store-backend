import mongoose, { Schema } from "mongoose";
import { ProductDocument } from "@Types/Schema/Product";

type ProductModel = mongoose.Model<ProductDocument>;

const productSchema = new Schema(
  {
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "the store field is required"],
    },
    name: {
      type: String,
      maxlength: [25, "the maximum length for a product name is 25 characters"],
      minlength: [3, "the minimum length for a product name is 3 characters"],
      required: [true, "the name field is required"],
    },
    price: {
      type: Number,
      required: [true, "the price field is required"],
    },
    productType: {
      type: String,
      enum: ["physical", "digital"],
      required: [true, "the productType field must be either physical or digital."],
    },
    description: {
      type: String,
      required: [true, "the description field is required"],
    },
    image: {
      type: [String],
      required: [true, "the image field is required"],
    },
    limitPerCart:Number,
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    stock: {
      type: Number,
      default: null,
      min: [0, "the stock field cannot be negative"],
    },
    weight: Number,
    isPreviewable: Boolean,
    isDownloadable: Boolean,
    isStreamable: Boolean,
    accessControl: {
      expiresAfter: Number,
      maxDownloads: Number,
    },
    fileSize: String,
    fileName: String,
    filePath: String,
    discount: { type: Number, default: 0, min: 0, max: 100 },
    numberOfPurchases: {
      // this counter should be increased once the users completed their payment process
      type: Number,
      default: 0,
    },
    ranking: {
      type: Number,
      default: null,
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
  },
  {
    discriminatorKey: "productType",
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

productSchema.index({ name: 1, store: 1 }, { unique: true });
productSchema.index({ ranking: 1 });
productSchema.index({ store: 1 });

// this pre(/^find/) hook is for populating the categories:
productSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
  // this.populate({ path: "categories", select: "name colour" });
  this.populate({ path: "store", select: "storeName verified" });
  next();
});

const Product = mongoose.model<ProductDocument, ProductModel>("Product", productSchema);

export default Product;
