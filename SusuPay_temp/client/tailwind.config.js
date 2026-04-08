/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          500: '#10b981',
          600: '#059669',
          900: '#064e3b',
        },
        sapphire: {
          DEFAULT: '#3b82f6',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        gold: '#fbbf24',
      },
    },
  },
  plugins: [],
};
