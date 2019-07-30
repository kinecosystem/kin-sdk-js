var path = require('path');

module.exports = {
  entry: [
    __dirname + '/scripts/bin/client.js'
  ],
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: './[name].bundle.js',
    path: path.resolve(__dirname, 'public')
  }
}