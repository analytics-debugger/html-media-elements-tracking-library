import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
const path = require('path');
const license = require('rollup-plugin-license');

const terserOptions = {
    compress: {
        passes: 2
    }
};

module.exports = [
    {
        input: "src/index.js",
        output: [
            {
                file: "dist/htmlMediaElementsTracker.amd.js",
                format: "amd"
            },
            {
                file: "dist/htmlMediaElementsTracker.amd.min.js",
                format: "amd",
                plugins: [terser(terserOptions)]
            },

            {
                file: "dist/htmlMediaElementsTracker.iife.js",
                name: "_mediaElementsTracker",
                format: "iife"
            },
            {
                file: "dist/htmlMediaElementsTracker.iife.min.js",
                name: "_htmlMediaElementsTracker",
                format: "iife",
                plugins: [terser(terserOptions)]
            },
            {
                file: "dist/htmlMediaElementsTracker.js",
                name: "_htmlMediaElementsTracker",
                format: "umd"
            },
            {
                file: "dist/htmlMediaElementsTracker.min.js",
                name: "_htmlMediaElementsTracker",
                format: "umd",
                plugins: [terser(terserOptions)]
            }
        ],
        plugins: [
            license({
                banner: `/*!
* 
*   <%= pkg.name %> <%= pkg.version %>
*   https://github.com/analytics-debugger/html-media-elements-tracking-library
*
*   Copyright (c) David Vallejo (https://www.thyngster.com).
*   This source code is licensed under the MIT license found in the
*   LICENSE file in the root directory of this source tree.
*
*/
`,
            }),            
            resolve(),
            babel({
                exclude: "node_modules/**"
            })
        ]
    },
    {
        input: "src/index.js",
        output: [
            {
                file: "dist/_htmlMediaElementsTracker.esm.js",
                format: "esm"
            },
            {
                file: "dist/_htmlMediaElementsTracker.esm.min.js",
                format: "esm",
                plugins: [terser(terserOptions)]
            }
        ]
    }
];
