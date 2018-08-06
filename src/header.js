// ==UserScript==
// @name         <@NAME@>
// @version      <@VERSION@>
// @namespace    https://github.com/evazion/danbooru-ex
// @source       https://github.com/evazion/danbooru-ex
// @description  Danbooru UI Enhancements
// @author       evazion
// @match        *://*.donmai.us/*
// @grant        none
// @run-at       document-body
// @downloadURL  <@URL@>
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.12.1/ui/widgets/selectable.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.12.1/ui/widgets/tooltip.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.1/moment.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js
// @require      https://unpkg.com/filesize@3.5.11
// @require      https://unpkg.com/css-element-queries@0.3.2/src/ResizeSensor.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/qtip2/3.0.3/jquery.qtip.js
// @require      https://unpkg.com/mousetrap@1.6.0/mousetrap.js
// @require      https://unpkg.com/mousetrap@1.6.0/plugins/record/mousetrap-record.js
// @require      https://unpkg.com/mousetrap@1.6.0/plugins/global-bind/mousetrap-global-bind.js
// ==/UserScript==

/*
 * What is a userscript? A miserable pile of hacks.
 */

console.log("Danbooru EX:", GM_info.script.version);
// console.time("loaded");
// console.time("preinit");
// console.time("initialized");
