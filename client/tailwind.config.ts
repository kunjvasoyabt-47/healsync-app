import type { Config } from "tailwindcss";

const config: Config = {
  // Define the paths to all of your template files
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // V4 handles theme extensions via globals.css @theme block,
  // so we leave 'theme' empty or very minimal here.
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;