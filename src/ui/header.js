import $ from "jquery";
import _ from "lodash";

import ModeMenu from "./mode_menu.js";
import PreviewPanel from "./preview_panel.js";

export default class Header {
  static initialize() {
    Header.initializeHeader();
    Header.initializeActions();

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

  static initializeActions() {
    $(Header.$el).on("ex.header-open", Header.open);
    $(Header.$el).on("ex.header-close", Header.close);
    $(Header.$el).on("ex.header-toggle", Header.toggle);
    $(Header.$el).on("ex.header-focus-search", Header.focusSearch);
    $(Header.$el).on("ex.header-execute-search-in-new-tab", Header.executeSearchInNewTab);
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
  }

  static close() {
    Header.$el.addClass("ex-static").removeClass("ex-fixed");
    EX.config.headerState = Header.$el.attr("class");
  }

  static open() {
    Header.$el.addClass("ex-fixed").removeClass("ex-static");
    EX.config.headerState = Header.$el.attr("class");
  }

  static toggle() {
    return Header.$el.hasClass("ex-fixed") ? Header.close() : Header.open();
  }

  static get $el()    { return $("#ex-header"); }
  static get $close() { return $("#ex-header .ex-header-close"); }
  static get $tags()  { return $("#ex-header #tags"); }

  static render() {
    return `
      <header style="display: none;" id="ex-header" class="${EX.config.headerState}">
        <h1><a href="/">Danbooru</a></h1>

        <form class="ex-search-box" action="/posts" accept-charset="UTF-8" method="get">
          <input type="text" name="tags" id="tags" class="ui-autocomplete-input" autocomplete="off">
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

            <input id="${EX.config.enableModeMenu ? "tag-script-field" : "" }" name="tag-script" type="text" placeholder="Enter tag script">
            <button name="apply" type="button">Apply</button>

            <label>Select</label>
            <button name="select-all" type="button">All/None</button>
            <button name="select-invert" type="button">Invert</button>
          </fieldset>
        </section>

	<a class="ex-header-close">
          <i class="fa fa-lg" aria-hidden="true"></i>
	</span>
      </header>
    `;
  }
}
