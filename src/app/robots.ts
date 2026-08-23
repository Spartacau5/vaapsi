import type { MetadataRoute } from 'next'
import { SITE_URL, absoluteUrl } from '@/lib/seo'

/**
 * robots.txt.
 *
 * `/cart`, `/checkout` and `/api` are disallowed: personal, transient or not
 * content. `/tokens` is an internal reference sheet. Everything else is open,
 * including the passport routes — those are the pages worth finding.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/cart', '/checkout', '/tokens', '/kitchen-sink'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
