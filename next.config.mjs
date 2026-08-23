/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * Placeholder photography only. `picsum.photos` is here so the fixtures
     * render at real dimensions during design review.
     *
     * REMOVE THIS before launch and replace with the real image host. A
     * production storefront should not be able to load images from an arbitrary
     * third party — see PRD open question #10 on who supplies photography.
     */
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
