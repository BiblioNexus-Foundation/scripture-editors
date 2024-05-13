/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        primary: "#FF5500",
        "primary-50": "#E4F2FF",
        secondary: "#151515",
        success: "#05C715",
        error: "#FF1500",
        validation: "#FFE5E5",
        light: "#E4F1FF",
        dark: "#333333",
      },
      height: {
        editor: "98vh",
        reference: "calc((-9.5rem + 100vh)/2)",
      },
    },
  },
  plugins: [],
};
