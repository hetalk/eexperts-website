/** @type {import('tailwindcss').Config} */
// Last Updated: 2025-09-16 16:55:42 IST
// Enhanced with brand colors from company logos
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Ritesource Brand Colors (Gold & Forest Green) - Enhanced for better contrast
        'primary': '#1B5E35',     // Darker Forest Green for better contrast (was #2E8B57)
        'primary-dark': '#155A2E', // Even darker Forest Green
        'primary-light': '#2E8B57', // Original Forest Green as light variant

        // eExperts Brand Colors (Cyan to Purple gradient) - Enhanced for better contrast
        'secondary': '#006B7A',    // Even darker Turquoise for better contrast (was #0087A1)
        'secondary-dark': '#004B5C', // Very dark Teal
        'secondary-light': '#00CED1', // Original Turquoise as light variant

        // Accent colors from both logos - Enhanced for better contrast
        'accent': '#856404',       // Darker Gold for better contrast (was #B8860B)
        'accent-light': '#B8860B',  // Original Gold as light variant
        'purple': '#5A1A7A',       // Darker Purple for better contrast (was #8A2BE2)
        'purple-light': '#8A2BE2',  // Original Purple as light variant

        // Text colors for proper contrast
        'text-primary': '#1B5E35', // Dark green for headings
        'text-secondary': '#006B7A', // Even darker turquoise for secondary text
        'text-accent': '#856404',   // Dark gold for accent text
        'text-dark': '#1F2937',     // Dark gray for body text

        // Neutral colors enhanced
        'dark': '#1F2937',         // Dark Gray
        'light': '#F9FAFB',        // Light Gray
        'bronze': '#CD853F',       // Bronze from Ritesource
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
}