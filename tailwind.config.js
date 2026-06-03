/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          bg: '#f5f7fa',
          primary: '#1565c0',
          hover: '#0d47a1',
          accent: '#1e88e5',
          border: '#e3eaf5',
          heading: '#0d1b3e',
          body: '#37474f',
          subtext: '#78909c',
          tableHeader: '#e8f0fe',
          tableRowHover: '#f0f6ff',
          inputBorder: '#90caf9',
          high: '#c62828',
          medium: '#ef6c00',
          low: '#2e7d32',
        }
      },
      boxShadow: {
        hospital: '0 2px 8px rgba(0,0,0,0.08)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
