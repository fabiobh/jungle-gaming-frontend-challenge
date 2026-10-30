import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#140D0A',
        'background-elevated': '#1C120D',
        surface: {
          DEFAULT: '#241612',
          card: '#241612',
          raised: '#2F1D15',
          dark: '#38220F',
        },
        border: {
          DEFAULT: '#3F2319',
          soft: '#55321F',
        },
        primary: {
          DEFAULT: '#F27A1A',
          hover: '#E0690E',
          active: '#C95B0A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#B39463',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#E89B55',
          foreground: '#140D0A',
        },
        text: {
          primary: '#FBFBFB',
          secondary: '#CFB28C',
          accent: '#E89B55',
          muted: '#B5A394',
        },
        status: {
          success: '#00A66C',
          error: '#ED1B2E',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
};

export default config;
