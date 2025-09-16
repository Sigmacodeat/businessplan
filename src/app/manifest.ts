import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Business Plan',
    short_name: 'BizPlan',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0ea5e9',
    theme_color: '#0ea5e9',
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
    ]
  };
}
