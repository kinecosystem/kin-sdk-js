const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    "kin-sdk-web": __dirname + "/scripts/src/web/sdk.ts",
    app: __dirname + "/scripts/src/web/app.ts"
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "./[name].bundle.js",
    path: path.resolve(__dirname, "public")
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html'
    })
  ],
  optimization: {
    removeAvailableModules: true,
    mergeDuplicateChunks: true,
  }
};
