import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

export default withUt({
  content: ["./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: "#FFFFFF",
        offwhite: "#F7FCFC",
        uiLight: "#F3FAFA",
        light: "#E0ECEE",
        "light-hover": "#E7F5F7",
        primary: "#8EB5B8",
        "primary-hover": "#A1CED1",
        secondary: "#06303E",
        "secondary-hover": "#094B61",
        dark: "#052630",
        grey: "#A7A7A7",
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', "monospace"],
        sans: ['"Proxima Nova Regular"', "sans-serif"],
        display: ['"Proxima Nova Extrabold"', "sans-serif"],
        displayBold: ['"Proxima Nova Bold"', "sans-serif"],
        displaySemiBold: ['"Proxima Nova Semibold"', "sans-serif"],
      },
      backgroundImage: {
        hero: "url('/bg.jpg')",
        heroAlt: "url('/hero-alt.jpg')",
      },
      // spacing: {
      //   '8xl': '96rem',
      //   '9xl': '128rem',
      // },
      // borderRadius: {
      //   '4xl': '2rem',
      // }
    },
  },
  plugins: [
    require("tailwindcss-react-aria-components"),
    require("tailwindcss-animate"),
  ],
});
