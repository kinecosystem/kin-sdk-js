var path = require("path");

module.exports = {
  entry: {
    "kin-sdk-client": __dirname + "/scripts/src/client.ts",
    "client-app": __dirname + "/scripts/src/client-app.ts"
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
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "./[name].bundle.js",
    path: path.resolve(__dirname, "public")
  }
};
