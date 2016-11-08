import fs from 'fs';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sass from 'rollup-plugin-sass';

const header = process.env.HEADER;

export default {
    moduleName: 'danbooruEX',
    banner: fs.readFileSync(header),
    entry: 'src/ex.js',
    dest: 'dist/danbooru-ex.user.js',
    format: 'iife',
    globals: {
        dexie: 'Dexie',
        filesize: 'filesize',
        lodash: '_',
        jquery: 'jQuery',
        moment: 'moment',
    },
    external: [
        'dexie',
        'filesize',
        'jquery',
        'lodash',
        'moment',
    ],
    plugins: [
        sass({
            insert: true,
            output: true,
        }),
	resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
    ],
};
