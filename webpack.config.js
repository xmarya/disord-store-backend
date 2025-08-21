import nodeExternals from "webpack-node-externals";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

const config = {
  mode: "production",
  entry: "./server.ts",
  output: {
    filename: "index.cjs",
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }],
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
};

export default config;
