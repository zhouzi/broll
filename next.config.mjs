/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Import images as base64 when suffixed with .inline
    // Useful for the default image
    const imageLoaderRule = config.module.rules.find(
      (rule) => rule.loader === "next-image-loader"
    );
    imageLoaderRule.exclude = /\.inline\.(png|jpg|jpeg|svg)$/i;
    config.module.rules.push({
      test: /\.inline\.(png|jpg|jpeg|gif)$/i,
      use: [
        {
          loader: "url-loader",
        },
      ],
    });

    // TODO: a build error is raised when minification is enabled: Nn is not defined
    //       couldn't track down what is breaking and why yet
    config.optimization.minimize = false;

    return config;
  },
};

export default nextConfig;
