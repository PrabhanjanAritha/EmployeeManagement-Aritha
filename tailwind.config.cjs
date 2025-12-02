module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          light: '#E3F2FD',
          dark: '#0052CC',
        },
        'background-light': '#FFFFFF',
        'background-dark': '#0F1419',
        'surface-light': '#F8F9FA',
        'surface-dark': '#1A1F2E',
        'text-light': '#111418',
        'text-dark': '#FFFFFF',
        'border-light': '#E9ECEF',
        'border-dark': '#2D3748',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
