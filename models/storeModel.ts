import { StoreDocument } from "@Types/Schema/Store";
import { Model, Schema, model } from "mongoose";

type StoreModel = Model<StoreDocument>;
export const storeSchema = new Schema<StoreDocument>(
  {
    storeName: {
      type: String,
      maxlength: [20, "the maximum length for a store name is 20 characters"],
      minlength: [3, "the minimum length for a store name is 3 characters"],
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
    productsType:{
      type:String,
      required:[true, "the productsType field is required"]
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
    storePages:[
      {
        title:{
          type:String,
          required: [true, "the title field inside storeLinks is required"]
        },
      markdown:{
        type:String,
        required: [true, "the markdown field inside storeLinks is required"]
      },
      _id:false
      },
    ],
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
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


//NOTE: I'm not sure if commenting out the below hook would break the code somewhere. I searched to see if it is essential inside a controller or a service but didn't find any thing.
// And for the reason why I commented it out is because the product model needs to populate the store,
// and the store in turn was going to populate its owner
// which is an unnecessary piece of data in most of the cases where the store data are obtained.
// storeSchema.pre(/^find/, function (this: Query<any, StoreDocument>, next) {
//   this.populate("owner");
//   next();
// });


// TODO: وثيقة العمل الحر أو اثبات التجارية

const Store = model<StoreDocument, StoreModel>("Store", storeSchema);

export default Store;
