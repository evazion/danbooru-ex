import fs from 'fs';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sass from 'rollup-plugin-sass';

const HEADER  = fs.readFileSync("src/header.js").toString();
const NAME    = process.env.NAME    || "Danbooru EX";
const VERSION = process.env.VERSION || Number(fs.readFileSync("VERSION").toString());
const URL     = process.env.URL     || "https://github.com/evazion/danbooru-ex/raw/stable/dist/danbooru-ex.user.js";

export default {
    moduleName: 'danbooruEX',
    banner: () => {
        return HEADER.replace(/<@NAME@>/g,    NAME)
                     .replace(/<@VERSION@>/g, VERSION)
                     .replace(/<@URL@>/g,      URL);
    },
    entry: 'src/ex.js',
    dest: 'dist/danbooru-ex.user.js',
    format: 'iife',
    globals: {
        filesize: 'filesize',
        lodash: '_',
        jquery: 'jQuery',
        moment: 'moment',
        mousetrap: "Mousetrap",
    },
    external: [
        'filesize',
        'jquery',
        'lodash',
        'moment',
        'mousetrap',
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
