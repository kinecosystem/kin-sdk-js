const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    app: __dirname + "/scripts/src/web/app.ts",
    "kin-sdk-web": __dirname + "/scripts/src/web/sdk.ts"
  },
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
  }
};
