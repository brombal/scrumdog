require("dotenv").config();
const path = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

/**
 * This file creates a configuration object for webpack.
 * `env` determines which build to make, which is either "client" or "ssr".
 * Development mode is determined from the WEBPACK_DEV_SERVER env variable.
 */

module.exports = () => {
  let config = {
    mode: "production",
    entry: { index: __dirname + "/src/main.tsx" },
    output: {
      path: __dirname + "/public/dist",
      filename: "[name].js",
      publicPath: process.env.URL_PUBLIC,
    },
    resolve: {
      alias: {
        "@client": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "../shared"),
        // "stylix": path.resolve(__dirname, "src/util/stylix"),
      },
      extensions: [".ts", ".tsx", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            configFile: __dirname + "/tsconfig.json",
          },
        },
        {
          test: /\.svg$/,
          loader: "svg-loader",
        },
        {
          test: /\.(css|txt)$/,
          loader: "raw-loader",
        },
        {
          test: /\.(png)$/,
          loader: "file-loader",
          options: { emitFile: true },
        },
      ],
    },
    plugins: [],
  };

  if (process.env.WEBPACK_DEV_SERVER) {
    config.resolve.alias["react-dom"] = "@hot-loader/react-dom";
    config = {
      ...config,
      mode: "development",
      devtool: "source-map",
      devServer: {
        contentBase: "./public",
        port: process.env.PORT,
        disableHostCheck: true,
        historyApiFallback: {
          index: "index.html",
        },
        // publicPath: "/",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    };
    config.plugins.push(new ForkTsCheckerWebpackPlugin());
    config.module.rules[0].options.transpileOnly = true;
    // config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};
