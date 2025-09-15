# Ritesource & eExperts Website

Modern static website for Ritesource Infosystems LLP and Efficiency Experts Data Solutions LLP.

## Tech Stack
- **Framework**: Astro
- **Styling**: Tailwind CSS
- **Hosting**: Cloudflare Pages
- **Forms**: Cloudflare Workers

## Development

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/hetalk/eexperts-website.git
cd eexperts-website
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:4321 in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

This site is automatically deployed to Cloudflare Pages when you push to the `main` branch.

## Project Structure

```
/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   ├── layouts/     # Page layouts
│   └── pages/       # Website pages
├── astro.config.mjs # Astro configuration
└── package.json     # Dependencies
```

## Contact

- **Ritesource**: info@ritesource.com
- **eExperts**: info@eexperts.info
- **Phone**: +91 79 4895 5466