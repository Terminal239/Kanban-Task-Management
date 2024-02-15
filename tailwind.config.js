/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        magenta: {
          900: "var(--clr-magenta-900)",
          800: "var(--clr-magenta-800)",
          700: "var(--clr-magenta-700)",
          400: "var(--clr-magenta-400)",
          200: "var(--clr-magenta-200)",
        },
        red: {
          400: "var(--clr-red-400)",
        },
        text: "var(--clr-text-grey)",
        lightGray: "#ced4da",
      },
    },
  },
  plugins: [],
};
