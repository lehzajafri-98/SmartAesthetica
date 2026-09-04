/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brandPurple: "#6A0DAD",
        brandPink: "#D36CFF",
      },

      backgroundImage: {
        pastelBg:
          "linear-gradient(135deg, #f3e8ff 0%, #e0d4ff 50%, #f8e9ff 100%)",
        accentGradient:
          "linear-gradient(135deg, #8b5cf6 0%, #c084fc 50%, #d946ef 100%)",
      },

      boxShadow: {
        soft:
          "0 6px 25px rgba(180, 120, 240, 0.2), 0 2px 10px rgba(160, 80, 220, 0.15)",
      },
    },
  },
  plugins: [],
};
