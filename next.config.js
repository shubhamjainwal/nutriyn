/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true,
  sw: "sw.js",
  publicExcludes: ["!icons/**/*"],
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
