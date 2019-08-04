const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    app: __dirname + "/scripts/src/web/app.ts",
    "kin-sdk": __dirname + "/scripts/src/web/sdk.ts"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  output: {
    filename: "./[name].bundle.js",
    path: path.resolve(__dirname, "public")
  }
};
