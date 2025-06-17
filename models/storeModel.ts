import { ProductDocument } from "../_Types/Product";
import { ReviewDocument } from "../_Types/Review";
import { StoreDocument } from "../_Types/Store";
import { Model, Query, Schema, model } from "mongoose";

type StoreModel = Model<StoreDocument>;
export const storeSchema = new Schema<StoreDocument>(
  {
    storeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    /* OLD CODE (kept for reference): 
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // SOLILOQUY: 
    the slug is the same as the name, should I made the slug a virtual field ?
    or maybe remove it completely and just use the storeName filed to make the slug ?
    },

    WHY I DECIDED TO REMOVE IT?
    - storing the slug as a static field whiles it’s just a transformation of storeName could lead to 
    redundant data and extra updates when storeName changes.
    I could've made it a virtual field but I don't think it's necessary.
    
  */
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: [true, "the description field is required"],
    },
    logo: String,
    storeAssistants: [
      {
        // relationship (child referencing) because it's 1-few relationship
        /* SOLILOQUY: not all stores will have an assistant right? so I'll make it a separate collection so the store docs won't get so large for nothing
                  also for scalability and future-proof that's better */
        type: Schema.Types.ObjectId,
        ref: "StoreAssistant",
        default: [], //is more intuitive than null.
      },
    ],
    /* OLD CODE (kept for reference): unique in an array doesn't enforce uniqueness across documents!!!
    categories: [{
      type: String,
      unique: true,
      colour: String,
      }],
      */
    // to be honest, I don't see any reasonable to store the categories inside the store doc
    // categories: [{
    //   type:Schema.Types.ObjectId,
    //   ref:"Category"
    // }],
    colourTheme: {
      /* SOLILOQUY: this should be one object not an array, 
      of course the plus users can views many theme but eventually they are going to select only one*/
      type: Schema.Types.ObjectId,
      ref: "ColourTheme",
      // default:"default-theme" //TODO: will be defined later
    },
    status: {
      type: String,
      enum: ["inProgress", "active", "maintenance", "suspended", "deleted"],
      required: [true, "the storeState is required"],
      default: "inProgress",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    shipmentCompanies: [
      {
        name: { type: String, required: true },
        accountNumber: { type: String, required: true },
      },
    ],
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },
    inPlan: {
      type: String,
      required: true,
      enum: ["basic", "plus", "unlimited"],
    },
    socialMedia: {
      instagram: String,
      tiktok: String,
      twitter: String,
      whatsapp: [String],
      email: String,
    },
    ranking: {
      type: Number,
      default: null,
      // NOTE: this filed will be used to presents the ranking of store's products, it's irrelevant to the storeStats model.
    },
    ratingsAverage: {
      type:Number,
      default:null,
      min: [1, "rating must be 1 to 5"],
      max: [5, "rating must be 1 to 5"],
      set: (rating:number) => Math.round(rating * 10) / 10
    },
    ratingsQuantity: {
      type:Number,
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

/* SOLILOQUY: I'm not sure about this virtual, since I can got all the store itself and its stats 
from the StoreStats Model, also using the virtual won't allow to do date filtering process */
// storeSchema.virtual<StoreStatsDocument[]>("stats", {
//   ref: "StoreStats",
//   localField: "_id",
//   foreignField: "store",
// });

storeSchema.pre(/^find/, function (this: Query<any, StoreDocument>, next) {
  this.populate("owner");
  next();
});

storeSchema.virtual<ProductDocument[]>("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "store",
});

storeSchema.virtual<ReviewDocument[]>("reviews", {
  ref:"Review",
  localField:"_id",
  foreignField: "reviewedResourceId"
});

// TODO: وثيقة العمل الحر أو اثبات التجارية

const Store = model<StoreDocument, StoreModel>("Store", storeSchema);

export default Store;
