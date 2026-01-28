const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

// Simple webpack config to handle requires
const compiler = webpack({
  mode: "development",
  entry: path.resolve(__dirname, "../storage.js"),
  output: {
    path: path.resolve(__dirname, "../temp"),
    filename: "temp-bundle.js",
    library: {
      type: "commonjs2",
    },
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|mp4|mp3|woff2|ttf)$/i,
        type: "asset/inline", // Ensures all assets are inlined as Base64
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
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, ".."), "node_modules"],
  },
  target: "node",
});

// Run webpack and generate storage.json
compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(
      err ||
        stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false,
        })
    );
    return;
  }

  // Get the bundled storage object
  const bundlePath = path.resolve(__dirname, "../temp/temp-bundle.js");
  const { storage } = require(bundlePath);

  // Create build directory if it doesn't exist
  const buildDir = path.resolve(__dirname, "../dist");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Write storage.json
  fs.writeFileSync(
    path.resolve(buildDir, "storage.json"),
    JSON.stringify(storage, null, 2)
  );

  // Cleanup temp files
  fs.rmSync(path.resolve(__dirname, "../temp"), {
    recursive: true,
    force: true,
  });

  console.log("Successfully exported storage.json to build directory");
});
