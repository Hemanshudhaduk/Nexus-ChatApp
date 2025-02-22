/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID : 1094597300,
    NEXT_PUBLIC_ZEGO_SERVER_ID : "0ce2f1fe992de3b36fd8121380602492",
  },
  images: {
    domains: ["lh3.googleusercontent.com", "localhost"], // ✅ Add "localhost"
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3005",
        pathname: "/uploads/images/**",
      },
    ],
  },
};

module.exports = nextConfig;
