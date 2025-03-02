import babel from "@rollup/plugin-babel";

import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs"; // ✅ Fixes CommonJS issues
import typescript from "@rollup/plugin-typescript";
import license from "rollup-plugin-license";

const terserOptions = {
    compress: { passes: 2 }
};

export default [
    {
        input: "src/index.ts",
        output: [
            { file: "dist/htmlMediaElementsTracker.amd.js", format: "amd" },
            { file: "dist/htmlMediaElementsTracker.amd.min.js", format: "amd", plugins: [terser(terserOptions)] },
            { file: "dist/htmlMediaElementsTracker.iife.js", name: "_mediaElementsTracker", format: "iife" },
            { file: "dist/htmlMediaElementsTracker.iife.min.js", name: "_htmlMediaElementsTracker", format: "iife", plugins: [terser(terserOptions)] },
            { file: "dist/htmlMediaElementsTracker.umd.js", name: "_htmlMediaElementsTracker", format: "umd" },
            { file: "dist/htmlMediaElementsTracker.umd.min.js", name: "_htmlMediaElementsTracker", format: "umd", plugins: [terser(terserOptions)] },
            { file: "dist/htmlMediaElementsTracker.esm.js", format: "esm" },
            { file: "dist/htmlMediaElementsTracker.esm.min.js", format: "esm", plugins: [terser(terserOptions)] }
        ],
        plugins: [
            resolve(), // ✅ Handles Node modules first
            commonjs(), // ✅ Converts CommonJS to ESM
            typescript(), // ✅ Handles TypeScript compilation
            babel({
                extensions: [".ts", ".js"],
                babelHelpers: "bundled",
                exclude: "node_modules/**",
                presets: [
                    ["@babel/preset-env", { targets: "> 0.25%, not dead" }],
                    "@babel/preset-typescript"
                ]
            }),
            license({
                banner: `/*!
* 
*   <%= pkg.name %> <%= pkg.version %>
*   https://github.com/analytics-debugger/html-media-elements-tracking-library
*
*   Copyright (c) Analytics Debugger S.L.U. (https://www.analytics-debugger.com)
*   Author: David Vallejo (https://www.thyngster.com)
*   This source code is licensed under the MIT license found in the
*   LICENSE file in the root directory of this source tree.
*
*/
`,
            })
        ]
    }
];
