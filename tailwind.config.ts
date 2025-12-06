import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'malama-primary': '#006633',
        'malama-secondary': '#E6F3EC',
        'malama-cta': '#3B82F6',
      },
    },
  },
  plugins: [],
};
export default config;

