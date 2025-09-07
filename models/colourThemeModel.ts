import { ColourThemeDocument } from "@Types/Schema/ColourTheme";
import { Model, Schema, model } from "mongoose";
import Store from "./storeModel";

type ColourThemeModel = Model<ColourThemeDocument>;
const colourThemeSchema = new Schema<ColourThemeDocument>({
  store: {
    type: Schema.Types.ObjectId,
    ref: "Store",
  },
  primary: {
    type: String,
    required: [true, "the primary field is required"],
  },
  secondary: {
    type: String,
    required: [true, "the secondary field is required"],
  },
  accent: {
    type: String,
    required: [true, "the accent field is required"],
  },
  fontColour: {
    type: String,
    required: [true, "the fontColour field is required"],
  },
  themeType: {
    type: String,
    enum: ["default", "custom"], // platform default OR store customisation
    default: "default",
  },
  isStoreDefault: {
    type: Boolean,
    default: false,
  },
});

// pre(save) hook to set the themType to custom is the store field was exist
colourThemeSchema.pre("save", function (next) {
  if (!this?.store) return next();
  this.themeType = "custom";
  next();
});

// this post(save) for setting the default theme to the store model
colourThemeSchema.post("save", async function (doc) {
  if (doc?.store && doc?.isStoreDefault) {
    await Store.findByIdAndUpdate({ id: doc.store }, { colourTheme: doc._id });
  }
});

const ColourTheme = model<ColourThemeDocument, ColourThemeModel>("ColourTheme", colourThemeSchema);

export default ColourTheme;
