export interface ColourTheme {
  id: string;
  themes: [
    {
      primary: string;
      secondary: string;
      accent: string;
      fontColour: string;
    }
  ];
}

export type ColourThemeDocument = ColourTheme;
