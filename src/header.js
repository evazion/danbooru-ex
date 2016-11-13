// ==UserScript==
// @name         Danbooru EX
// @namespace    https://github.com/evazion/danbooru-ex
// @version      2317
// @source       https://danbooru.donmai.us/users/52664
// @description  Danbooru UI Enhancements
// @author       evazion
// @match        *://*.donmai.us/*
// @match        *://localhost/*
// @grant        none
// @run-at       document-body
// @downloadURL  https://github.com/evazion/danbooru-ex/raw/stable/dist/danbooru-ex.user.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.11.2/ui/selectable.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.11.2/ui/tooltip.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.js
// @require      https://unpkg.com/filesize@3.3.0
// @require      https://unpkg.com/css-element-queries@0.3.2/src/ResizeSensor.js
// ==/UserScript==

/*
 * What is a userscript? A miserable pile of hacks.
 */

console.log("Danbooru EX:", GM_info.script.version);
console.time("loaded");
console.time("preinit");
console.time("initialized");
