import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1e2128',
        card: '#252830',
        text: {
          primary: '#f0ebe3',
          secondary: '#8b8680',
        },
        accent: {
          red: '#d4745c',
          teal: '#7a9a8a',
          amber: '#e6b450',
          green: '#8aaa7a',
        },
      },
      fontFamily: {
        serif: ['"LXGW WenKai"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        content: '680px',
        page: '1200px',
      },
      borderRadius: {
        journal: '6px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(212, 116, 92, 0.15)',
        'glow-sm': '0 0 15px rgba(212, 116, 92, 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
