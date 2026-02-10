/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Ruri (Lapis Lazuli)
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        background: '#F3F4F6', // Surface (Pale Gray)
        text: {
          DEFAULT: '#1F2937', // Dark Gray (Not pure black)
        },
        // Category Colors
        category: {
          announcements: '#E64A19', // Akane
          disaster: '#F57C00', // Mikan
          garbage: '#689F38', // Wakakusa
          ads: '#7B1FA2', // Edo-Murasaki
        },
        accent: {
          DEFAULT: '#2563EB', // Map accent to primary for generic usage unless category specific
          hover: '#1D4ED8',
        }
      },
      fontFamily: {
        sans: ['"BIZ UDPGothic"', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2rem', { lineHeight: '1.2', fontWeight: '700' }], // 32px
        'menu': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }], // 24px
        'body': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }], // 20px
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
