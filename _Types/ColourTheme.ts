import mongoose from "mongoose";
import { MongoId } from "./MongoId";

export interface ColourTheme {
      store?:MongoId
      primary: string;
      secondary: string;
      accent: string;
      fontColour: string;
      themeType: "default" | "custom",
      isStoreDefault?:boolean,
}

export type ColourThemeDocument = ColourTheme & mongoose.Document;
