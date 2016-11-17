// ==UserScript==
// @name         <@NAME@>
// @version      <@VERSION@>
// @namespace    https://github.com/evazion/danbooru-ex
// @source       https://github.com/evazion/danbooru-ex
// @description  Danbooru UI Enhancements
// @author       evazion
// @match        *://*.donmai.us/*
// @match        *://localhost/*
// @grant        none
// @run-at       document-body
// @downloadURL  <@URL@>
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.11.2/ui/selectable.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.11.2/ui/tooltip.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.js
// @require      https://unpkg.com/filesize@3.3.0
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
console.time("loaded");
console.time("preinit");
console.time("initialized");

window.moment = moment;
window.Mousetrap = Mousetrap;
