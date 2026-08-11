/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        liquid: {
          base: '#07130F',
          secondary: '#10251C',
          ivory: '#F5F2E8',
          living: '#B9E48C',
          mist: '#A8D8E8',
          sun: '#EBCB78',
          coral: '#F28B78',
          glass: 'rgba(255, 255, 255, 0.07)',
          border: 'rgba(255, 255, 255, 0.12)',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glass-deep': '0 16px 48px -8px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glow-living': '0 0 25px -5px rgba(185, 228, 140, 0.3)',
        'glow-sun': '0 0 25px -5px rgba(235, 203, 120, 0.3)',
      },
    },
  },
  plugins: [],
}
