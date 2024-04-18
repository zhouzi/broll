/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // TODO: a build error is raised when minification is enabled: Nn is not defined
    //       couldn't track down what is breaking and why yet
    config.optimization.minimize = false;
    return config;
  },
};

export default nextConfig;
