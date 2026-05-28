import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        magenta: "#F54291",
        rosaMedio: "#FF78AE",
        rosaClaro: "#FFA0D2",
        crema: "#FFF8CD",
        dorado: "#D4AF37",
        doradoOscuro: "#C5A059",
        tinta: "#3B2430"
      },
      boxShadow: {
        luxury: "0 20px 60px rgba(245,66,145,.18)"
      }
    }
  },
  plugins: []
};

export default config;
