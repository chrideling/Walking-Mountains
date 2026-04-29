/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Domain colors
        body: {
          DEFAULT: '#C05C2E',
          50: '#FBF3EE',
          100: '#F5E3D6',
          200: '#E9C4AB',
          300: '#DBA07D',
          400: '#CE7D52',
          500: '#C05C2E',
          600: '#A34D26',
          700: '#84401F',
          800: '#643217',
          900: '#43210F',
        },
        mind: {
          DEFAULT: '#3D5A8A',
          50: '#EEF2F8',
          100: '#D9E2F1',
          200: '#B3C5E3',
          300: '#8DA8D5',
          400: '#668BC7',
          500: '#3D5A8A',
          600: '#344E78',
          700: '#2A3F60',
          800: '#203048',
          900: '#152030',
        },
        world: {
          DEFAULT: '#4A7358',
          50: '#EEF5F1',
          100: '#D9EBE0',
          200: '#B2D6C1',
          300: '#8BC2A2',
          400: '#64AE84',
          500: '#4A7358',
          600: '#3F624B',
          700: '#33503D',
          800: '#273D2E',
          900: '#1A291F',
        },
        // Weather / energy palette (separate from domain)
        weather: {
          clear: '#F5F0E8',
          'clear-accent': '#D4A853',
          hazy: '#EDE8E0',
          'hazy-accent': '#B8906A',
          foggy: '#E0DBD5',
          'foggy-accent': '#8C7B6E',
        },
        // Neutrals — warm, not clinical
        stone: {
          50: '#FAFAF9',
          100: '#F5F4F2',
          200: '#ECEAE6',
          300: '#D8D4CE',
          400: '#B8B2A8',
          500: '#928C82',
          600: '#706A60',
          700: '#524D44',
          800: '#36322B',
          900: '#1E1B16',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
