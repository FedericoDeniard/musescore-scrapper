import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeExternals } from "rollup-plugin-node-externals";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    nodeExternals(),
    resolve(),
    typescript({ exclude: ["frontend/**/**"] }),
    commonjs(),
    json(),
  ],
};
