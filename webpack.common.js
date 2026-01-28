// webpack.common.js
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "engine/index.js"),
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|mp4|mp3|woff2|ttf)$/i,
        type: "asset/inline", // Ensures all assets are inlined as Base64
      },
      {
        test: /\.(atlas|json)$/i,
        type: "asset/source",
      },
      {
        test: /\.glb$/i,
        type: "asset/inline",
        generator: {
          dataUrl: (content) => {
            return `data:application/octet-stream;base64,${content.toString(
              "base64"
            )}`;
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "engine/index.html"),
      inject: "body",
      scriptLoading: "module",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
  ],
  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".jsx", ".json"],
  },
};
