// Imports
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin')
require("babel-register");
// Webpack Configuration
const config = {
  // Entry
  entry: './src/index.js',  
  // Output
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.min.js',
  },
  // Loaders
  module: {
    rules : [
      // JavaScript/JSX Files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  },
  // Plugins
  plugins: [
    new htmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html',
      hash: true
    })
  ],
};
// Exports
module.exports = config;