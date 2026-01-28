const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const webpack = require("webpack");
const path = require("path");

module.exports = merge(commonConfig, {
  mode: "development",
  devtool: "inline-source-map", // Helps with debugging in development
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    hot: true, // Enables Hot Module Replacement
    open: true, // Open the browser on startup
    liveReload: false, // Disable live reload
    port: 3000, // Port for the development server
    watchFiles: ["src/**/*"], // Watch these files for changes
    client: {
      overlay: true, // Show error overlay in the browser
    },
    historyApiFallback: true, // For handling routing in SPAs
    // Remove the old watchOptions and use watchFiles instead
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/", // Explicitly set the public path
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // Enables Hot Module Replacement
   
  ],
});
