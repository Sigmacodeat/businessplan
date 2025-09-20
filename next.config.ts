import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Point to the i18n request configuration (required by next-intl v4)
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Erweitere NextConfig um die optionale allowedDevOrigins-Eigenschaft (nur Dev)
interface ExtendedNextConfig extends NextConfig {
  allowedDevOrigins?: string[];
}

const nextConfig: ExtendedNextConfig = {
  // Ensure Turbopack selects this project as root (multiple lockfiles detected)
  turbopack: {
    // Use process.cwd() instead of __dirname to be ESM-safe on Vercel/Edge
    root: process.cwd()
  },
  // Hinweis: Manifest wird über die Route src/app/manifest.ts ausgeliefert
  // Ein eigener Header-Eintrag für /site.webmanifest ist nicht nötig,
  // da unten ein Redirect auf /manifest.webmanifest existiert.
  // Ensure source maps are generated for debugging
  productionBrowserSourceMaps: true,
  // ESLint wieder aktiv
  eslint: {
    ignoreDuringBuilds: true
  },
  // Erlaube Cross-Origin-Dev-Zugriffe (z. B. wenn unter 127.0.0.1 zugegriffen wird)
  // Siehe: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  allowedDevOrigins: [
    '127.0.0.1'
    // weitere Einträge bei Bedarf: 'localhost', '*.dev.mein-host.tld'
  ],
  
  async redirects() {
    return [
      // Legacy-Locale-Prefix 'de' entfernen -> Root (as-needed)
      {
        source: '/de/:path*',
        destination: '/:path*',
        permanent: true
      }
    ];
  }
};

export default withNextIntl(nextConfig);
