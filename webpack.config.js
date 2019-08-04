const path = require("path");
const webpack = require("webpack");
module.exports = {
  entry: {
    app: __dirname + "/scripts/src/web/app.ts",
    "kin-sdk": __dirname + "/scripts/src/web/sdk.ts"
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    // Ignore native modules (ed25519)
    new webpack.IgnorePlugin(/ed25519/)
  ],
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "./[name].bundle.js",
    path: path.resolve(__dirname, "public")
  }
};
