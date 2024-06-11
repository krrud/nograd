import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      width: {
        "20": "80px",
      },
      backgroundColor: {
        "layer": "#589CBF",
        "data": "#73BFB8",
        "model": "#E85F5C",
      },
      fontSize: {
        "xxs": "0.55rem"
      },
    },
  },
  plugins: [],
};
export default config;
