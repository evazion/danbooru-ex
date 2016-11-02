import ModeMenu from "./mode_menu.js";
import PreviewPanel from "./preview_panel.js";

export default class Header {
  static initialize() {
    Header.initializeHeader();
    Header.initializeHotkeys();

    EX.config.enableModeMenu && Header.initializeModeMenu();
    EX.config.enablePreviewPanel && PreviewPanel.initialize();
  }

  static initializeHeader() {
    let $header = $(`
      <header id="ex-header">
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

            <input name="tag-script" type="text" placeholder="Enter tag script">
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
    `).insertBefore("#top");

    // Initalize header search box.
    $("#ex-header #tags").val($("#sidebar #tags").val());
    Danbooru.Autocomplete.initialize_all();

    $(".ex-header-close").click(Header.toggleClose);

    $header.addClass(EX.config.headerState);
  }

  static initializeHotkeys() {
    let $search = $("#ex-header #tags");

    $search.keydown("ctrl+return", e => {
      const tags = $(e.target).val().trim();
      window.open(`/posts?tags=${encodeURIComponent(tags)}`, "_blank").focus();
    });

    // Shift+Q: Focus and search box.
    $(document).keydown('shift+q', e => {
      // Add a space to end if box is non-empty and doesn't already have trailing space.
      $search.val().length && $search.val((i, v) => v.replace(/\s*$/, ' '));
      $search.focus();

      e.preventDefault();
    });
  }

  static initializeModeMenu() {
    $(".ex-mode-menu").show();
    ModeMenu.initialize();
  }

  static toggleClose(event) {
    let $header = $("#ex-header");

    if ($header.hasClass("ex-fixed")) {
      $header.slideUp().promise().then(e => {
        $header.toggleClass("ex-fixed ex-static").show();
        EX.config.headerState = $header.attr("class");
      });
    } else {
      $header.toggleClass("ex-fixed ex-static");
      EX.config.headerState = $header.attr("class");
    }

    event.preventDefault();
  }
}
