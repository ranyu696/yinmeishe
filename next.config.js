/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    images: {
        domains: ['localhost'], // 添加您的域名
      },
    experimental: {
        serverComponentsExternalPackages: ['sharp'],
      },
};

export default config;
