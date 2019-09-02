const path = require("path");

module.exports = {
  entry: {
    "kin-sdk-js-common": path.join(__dirname, "src/index.ts")
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
    filename: "./[name].js",
    library: 'KinSdk',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    path: path.resolve(__dirname, "public")
  }
};
