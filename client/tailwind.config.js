/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: '#0d1117',
                    card: '#161b22',
                    hover: '#1c2128',
                },
                neon: {
                    purple: '#a371f7',
                    cyan: '#39d0d8',
                    pink: '#f778ba',
                },
                text: {
                    primary: '#e6edf3',
                    muted: '#8b949e',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            keyframes: {
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.35s ease-out both',
            },
        },
    },
    plugins: [],
}
