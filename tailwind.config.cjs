/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e"
        },
        accent: "#f97316"
      },
      boxShadow: {
        cta: "0 12px 28px rgba(249, 115, 22, 0.35)"
      }
    }
  },
  plugins: []
};
