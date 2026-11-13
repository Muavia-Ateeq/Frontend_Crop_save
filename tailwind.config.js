/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:      '#3B6D11',
        primaryLight: '#EAF3DE',
        primaryMid:   '#639922',
        teal:         '#0F6E56',
        tealLight:    '#E1F5EE',
        surface:      '#F5F5F3',
        ink:          '#1A1A1A',
        muted:        '#888780',
        line:         '#E5E5E3',
        danger:       '#A32D2D',
        warning:      '#854F0B',
        warningBg:    '#FAEEDA',
        success:      '#0F6E56',
        successBg:    '#E1F5EE',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up':  'fadeUp 0.5s ease forwards',
        'scale-in': 'scaleIn 0.6s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}
