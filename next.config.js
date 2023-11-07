/** @type {import('next').NextConfig} */

/**
 * @type {import('next').NextConfig}
 */
 
 

const nextConfig = {
  // experimental: {
  //   appDir: true,
  // },
  async rewrites() {
    return [
      {
        source: '/',
        destination: 'https://clarkgerges-001-site1.ctempurl.com/:path*',
      },
    ]
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

}
 
module.exports = nextConfig

 
 