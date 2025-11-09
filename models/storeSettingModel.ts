import { StoreSettingDocument } from "@Types/Schema/StoreSetting";
import mongoose, { Model, Schema } from "mongoose";

type StoreSettingModel = Model<StoreSettingDocument>;
const storeSettingSchema = new Schema<StoreSettingDocument>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref:"Store",
      unique: true,
      required: [true, "storeId field is required"],
    },
    domain: {
      name: {
        type: String,
        default: "store domain value",
      },
    },
    seo: {
      title: String,
      description: String,
      keywords: String,
      sitemap: String,
    },
    colourTheme: {
      /* SOLILOQUY: this should be one object not an array, 
      of course the plus users can views many theme but eventually they are going to select only one*/
      type: Schema.Types.ObjectId,
      ref: "ColourTheme",
      // default:"default-theme" //TODO: will be defined later
    },
    socialMedia: {
      instagram: String,
      tiktok: String,
      twitter: String,
      whatsapp: [String],
      email: String,
    },
    storePages: [
      {
        title: {
          type: String,
          required: [true, "the title field inside storeLinks is required"],
        },
        markdown: {
          type: String,
          required: [true, "the markdown field inside storeLinks is required"],
        },
        _id: false,
      },
    ],
    address: {
      street: { type: String, default: "street value" },
      city: { type: String, default: "city value" },
      state: { type: String, default: "state value" },
      postalCode: { type: String, default: "postalCode value" },
      country: { type: String, default: "country value" },
      phone: { type: String, default: "phone value" },
    },
    shipmentCompanies: [
      {
        name: { type: String, default: "name value" },
        accountNumber: { type: String, default: "accountNumber value" },
        _id: false,
      },
    ],
    paymentMethods: {
      name: {
        type: String,
        default: "payment method name",
      },
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

storeSettingSchema.pre(/^find/, function(this:mongoose.Query<any, StoreSettingDocument>, next) {
    this.populate({ path: 'storeId', select: 'inPlan owner' });

    next();
})

const StoreSetting = mongoose.model<StoreSettingDocument, StoreSettingModel>("StoreSetting", storeSettingSchema);

export default StoreSetting;
