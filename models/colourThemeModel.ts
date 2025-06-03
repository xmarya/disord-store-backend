import { ColourThemeDocument } from "../_Types/ColourTheme";
import { Model, Schema, model } from "mongoose";

type ColourThemeModel = Model<ColourThemeDocument>;
const colourTheme = new Schema<ColourThemeDocument>({
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
    type:String,
    enum: ["default", "custom"],
    default: "default"
  }
});

const ColourTheme = model<ColourThemeDocument, ColourThemeModel>("ColourTheme", colourTheme);

export default ColourTheme;
