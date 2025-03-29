import { ColourThemeDocument } from "../_Types/ColourTheme";
import { Model, Schema, model } from "mongoose";

type ColourThemeModel = Model<ColourThemeDocument>;
const colourTheme = new Schema<ColourThemeDocument>({
  themes: [
    {
      primary: {
        type: String,
        required: true,
      },
      secondary: {
        type: String,
        required: true,
      },
      accent: {
        type: String,
        required: true,
      },
      fontColour: {
        type: String,
        required: true,
      },
    },
  ],
});

const ColourTheme =
  model<ColourThemeDocument, ColourThemeModel>("ColourTheme", colourTheme);

export default ColourTheme;
