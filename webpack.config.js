import nodeExternals from "webpack-node-externals";

const config = {
  mode: "production",
  entry: "./server.ts",
  output: {
    filename: "index.cjs",
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"],
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" }],
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
};

export default config;
