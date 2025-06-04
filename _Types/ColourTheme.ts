import mongoose from "mongoose";

export interface ColourTheme {
      primary: string;
      secondary: string;
      accent: string;
      fontColour: string;
      themeType: "default" | "custom"
}

export type ColourThemeDocument = ColourTheme & mongoose.Document;
