// webpack.prod.js
const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const HtmlInlineCssWebpackPlugin =
  require("html-inline-css-webpack-plugin").default;
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");
const { IgnorePlugin } = require("webpack");
const webpack = require("webpack");
const { settings } = require("./settings.js");

module.exports = merge(commonConfig, {
  mode: "production",
  optimization: {
    minimize: true, // Enables optimization and minification
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: settings.dropConsole, // Remove console logs
            dead_code: true, // Remove unreachable code
            unused: true, // Remove unused variables/functions
            // Additional options to further reduce size
            passes: 2, // Apply multiple passes for better compression
            toplevel: true, // Drop unused top-level variables/functions
          },
          output: {
            comments: false, // Remove comments
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    // new HtmlInlineScriptPlugin(),
    new HtmlInlineCssWebpackPlugin(),

    new IgnorePlugin({
      resourceRegExp: /^xmlhttprequest$/i, // Ignores all references to XMLHttpRequest
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
    }),

    // new BundleAnalyzerPlugin(),
    // new CompressionPlugin({
    //   filename: "[path][base].br",
    //   algorithm: "brotliCompress",
    //   test: /\.(js|css|html|svg)$/,
    //   compressionOptions: {
    //     level: 11,
    //   },
    //   threshold: 10240,
    //   minRatio: 0.8,
    //   deleteOriginalAssets: false, // Set to true if you want to remove the original files
    // }),
  ],
});
