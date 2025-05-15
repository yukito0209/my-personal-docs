/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable React StrictMode for testing
  experimental: {
    // 如果您使用了 appDir，则可能需要此项，但根据上下文，您似乎正在使用
  },
  // 其他 Next.js 配置...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pximg.net',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'p.inari.site',
      },
       {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    // 添加 glslify-loader 以处理 .glsl 文件
    config.module.rules.push({
      test: /\.glsl$/,
      use: ['glslify-loader'],
    });

    // Three.js ES Module HMR (Hot Module Replacement) and tree-shaking support.
    // This is an example if you were to use Three.js directly, may not be needed for pixi
    config.module.rules.push({
        test: /\.m?js$/,
        resolve: {
            fullySpecified: false, // This helps with some ESM module resolution issues
        },
    });
    
    // Fixes npm packages that depend on `fs` module, etc.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        // 'stream': require.resolve('stream-browserify'), // Example for stream
        // 'crypto': require.resolve('crypto-browserify'), // Example for crypto
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
