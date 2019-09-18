const path = require("path");
const version = require("./package.json").version;

module.exports = {
  entry: {
    "kin-sdk-common": path.join(__dirname, "src/index.ts")
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
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
    filename: `./[name]@${version}.js`,
    library: "KinSdkCommon",
    globalObject: "typeof self !== 'undefined' ? self : this",
    path: path.resolve(__dirname, "public")
  }
};
