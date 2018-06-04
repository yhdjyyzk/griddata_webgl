var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
   // devtool: 'inline-source-map',
   entry: {
      bundle: './src/index.js'
   },
   output: {
      path: __dirname + "/dist/",
      filename: '[name].js',
   },
   module: {
      rules: [
         {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
               fallback: 'style-loader', use: [{
                  loader: 'css-loader', options: {
                     minimize: true
                  }
               }]
            })
         },
         {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract({
               fallback: 'style-loader',
               use: 'css-loader!less-loader'
            })
         },
         {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract({
               fallback: 'style-loader',
               use: 'css-loader!sass-loader'
            })
         },

         {
            test: /\.js$/,
            use: ['babel-loader'],
            exclude: /node_modules/
         },
         {
            test: /\.(jpg|png)$/,
            loader: 'url-loader?limit=8192'
         },
         {
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
            loader: 'file-loader'
         },
         {
            test: /\.worker\.js$/,
            use: { loader: 'worker-loader', options: { publicPath: '/dist/workers/', inline: true } }
         }
      ]
   },
   plugins: [
      new ExtractTextPlugin({filename: '[name].css'}),
      new CleanWebpackPlugin([]),
      new HtmlWebpackPlugin({
         title: "3d"
      })
   ],
   resolve: {
      modules: [
         "node_modules",
         path.resolve(__dirname, "./")
      ]
   },
   // optimization: {
   //    splitChunks: {
   //       cacheGroups: {
   //          commons: {
   //             chunks: "initial",
   //             test: /react|lodash|react-dom|redux|react-redux|markdown-it|core-decorators/,
   //             name: "vendor", 
   //          }
   //       }
   //    }
   // }
}