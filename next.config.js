// Disable PWA to fix login freeze issue
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
// });

const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    buildActivity: false,
  },
}

// module.exports = withPWA(nextConfig)
module.exports = nextConfig
