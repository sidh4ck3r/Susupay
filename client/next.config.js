/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Paystack and external resources
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' http://* https://* https://api.paystack.co https://checkout.paystack.com",
              "frame-src 'self' https://checkout.paystack.com https://js.paystack.co",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async rewrites() {
    // In development, proxy to local backend.
    // In production, fallback to Render API if NEXT_PUBLIC_API_URL isn't set.
    const isDev = process.env.NODE_ENV === 'development';
    const apiBase = isDev ? 'http://127.0.0.1:5050' : 'https://susupay-api.onrender.com';

    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
