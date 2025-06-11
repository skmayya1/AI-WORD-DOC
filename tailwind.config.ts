import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",             // App directory (if using App Router)
    "./components/**/*.{ts,tsx}",      // Your components directory
  ],
  theme: {
    extend: {

    },
  },
  plugins: [],
};

export default config;