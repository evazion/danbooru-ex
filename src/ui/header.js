/* global Danbooru */

import $ from "jquery";
import _ from "lodash";

import EX from "../ex.js";
import ModeMenu from "./mode_menu.js";
import PreviewPanel from "./preview_panel.js";

export default class Header {
  static initialize() {
    Header.initializeHeader();

    if (EX.config.enableModeMenu) {
      Header.initializeModeMenu();

      if (EX.config.enablePreviewPanel) {
        PreviewPanel.initialize();
      }
    }
  }

  static initializeHeader() {
    let $header = $(Header.render()).insertBefore("#top");
    _.defer(() => $header.show());

    // Move news announcements inside of EX header.
    $("#news-updates").insertBefore("#ex-header .ex-header-wrapper");

    // Initalize header search box.
    Header.$tags.val($("#sidebar #tags").val());
    Danbooru.Autocomplete.initialize_all();

    Header.$close.click(Header.toggle);
    $(document).scroll(_.throttle(Header.onScroll, 16));
  }

  static initializeModeMenu() {
    $(".ex-mode-menu").show();
    ModeMenu.initialize();
  }

  static onScroll() {
    $("#ex-header").toggleClass("ex-header-scrolled", window.scrollY > 0, { duration: 100 });
    // Shrink header after scrolling down.
    window.scrollY > 0 && $("header h1").addClass("ex-small-header");
  }

  static executeSearchInNewTab() {
    // XXX
    if ($("#ex-header #ex-tags:focus").length) {
      const tags = Header.$tags.val().trim();
      window.open(`/posts?tags=${encodeURIComponent(tags)}`, "_blank").focus();
    }
  }

  static focusSearch() {
    // Add a space to end if box is non-empty and doesn't already have trailing space.
    Header.$tags.val().length && Header.$tags.val((i, v) => v.replace(/\s*$/, ' '));
    Header.$tags.focus();
    return false;
  }

  static toggle() {
    Header.$el.toggleClass("ex-fixed ex-static");
    Header.$close.find("i").toggleClass("fa-times-circle fa-thumbtack");
    EX.config.headerFixed = !EX.config.headerFixed;
  }

  static get $el()    { return $("#ex-header"); }
  static get $close() { return $("#ex-header .ex-header-close"); }
  static get $tags()  { return $("#ex-header #ex-tags"); }

  static render() {
    return `
      <header style="display: none;" id="ex-header" class="${EX.config.headerFixed ? "ex-fixed" : "ex-static"}">
        <div class="ex-header-wrapper">
          <h1><a href="/">Danbooru</a></h1>

          <form class="ex-search-box" action="/posts" accept-charset="UTF-8" method="get">
            <input type="text" data-autocomplete="tag-query" name="tags" id="ex-tags" class="ui-autocomplete-input" autocomplete="off">
            <input type="submit" value="Go">
          </form>

          <section class="ex-mode-menu" style="display: none">
            <label for="mode">Mode</label>
            <select name="mode">
              <option value="view">View</option>
              <option value="preview">Preview</option>
              <option value="tag-script">Tag script</option>
            </select>

            <fieldset class="ex-tag-script-controls" style="display: none">
              <select name="tag-script-number">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
              </select>

              <input id="${EX.config.enableModeMenu ? "tag-script-field" : "" }" name="tag-script" type="text" data-autocomplete="tag-query" placeholder="Enter tag script">
              <button name="apply" type="button">Apply</button>

              <label>Select</label>
              <button name="select-all" type="button">All/None</button>
              <button name="select-invert" type="button">Invert</button>
            </fieldset>
          </section>

          <a class="ex-header-close">
            <i class="fas fa-lg ${EX.config.headerFixed ? "fa-times-circle" : "fa-thumbtack"}" aria-hidden="true"></i>
          </a>
        </div>
      </header>
    `;
  }
}
