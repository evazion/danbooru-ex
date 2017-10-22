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
    // XXX Shrink header after scrolling past navbar.
    // $("header h1").toggleClass("ex-small-header", window.scrollY > 0, { duration: 100 });
  }

  static executeSearchInNewTab() {
    // XXX
    if ($("#ex-header #tags:focus").length) {
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

  static close() {
    Header.$el.addClass("ex-static").removeClass("ex-fixed");
    EX.config.headerFixed = false;
  }

  static open() {
    Header.$el.addClass("ex-fixed").removeClass("ex-static");
    EX.config.headerFixed = true;
  }

  static toggle() {
    return EX.config.headerFixed ? Header.close() : Header.open();
  }

  static get $el()    { return $("#ex-header"); }
  static get $close() { return $("#ex-header .ex-header-close"); }
  static get $tags()  { return $("#ex-header #tags"); }

  static render() {
    return `
      <header style="display: none;" id="ex-header" class="${EX.config.headerFixed ? "ex-fixed" : "ex-static"}">
        <h1><a href="/">Danbooru</a></h1>

        <form class="ex-search-box" action="/posts" accept-charset="UTF-8" method="get">
          <input type="text" name="tags" id="tags" class="ui-autocomplete-input" autocomplete="off">
          <input type="submit" value="Go" class="ui-button ui-widget ui-corner-all tiny gradient">
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

            <input id="${EX.config.enableModeMenu ? "tag-script-field" : "" }" name="tag-script" type="text" placeholder="Enter tag script">
            <button name="apply" type="button" class="ui-button ui-widget ui-corner-all tiny gradient">Apply</button>

            <label>Select</label>
            <button name="select-all" type="button" class="ui-button ui-widget ui-corner-all tiny gradient">All/None</button>
            <button name="select-invert" type="button" class="ui-button ui-widget ui-corner-all tiny gradient">Invert</button>
          </fieldset>
        </section>

	<a class="ex-header-close">
          <i class="fa fa-lg" aria-hidden="true"></i>
	</span>
      </header>
    `;
  }
}
