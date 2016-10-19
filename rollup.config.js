import fs from 'fs';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

export default {
    moduleName: 'danbooruEX',
    banner: fs.readFileSync("src/header.js"),
    entry: 'src/core.js',
    dest: 'dist/danbooru-ex.user.js',
    format: 'iife',
    globals: {
        lodash: '_',
        jquery: 'jQuery',
        moment: 'moment',
    },
    external: [
        'jquery',
        'lodash',
        'moment',
    ],
    plugins: [
        postcss({
            extensions: [ '.css' ],
        }),
	resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
    ],
};
