import _ from "lodash";

import Posts from "./posts.js";
import PreviewPanel from "./preview_panel.js";

export default class ModeMenu {
  static initialize() {
    ModeMenu.uninitializeDanbooruModeMenu();
    ModeMenu.initializeModeMenu();
    ModeMenu.initializeTagScriptControls();
    ModeMenu.initializeThumbnails();
    ModeMenu.initializeHotkeys();
  }

  static uninitializeDanbooruModeMenu() {
    Danbooru.PostModeMenu.initialize = _.noop;
    Danbooru.PostModeMenu.show_notice = _.noop;
    $(".post-preview a").unbind("click", Danbooru.PostModeMenu.click);
    $(document).unbind("keydown", "1 2 3 4 5 6 7 8 9 0", Danbooru.PostModeMenu.change_tag_script);
    $("#sidebar #mode-box").hide();
  }

  static initializeModeMenu() {
    $('.ex-mode-menu select[name="mode"]').change(ModeMenu.switchMode);
    ModeMenu.setMode(EX.config.modeMenuState);
  }

  static initializeTagScriptControls() {
    $('.ex-mode-menu input[name="tag-script"]').on(
      "input", _.debounce(ModeMenu.saveTagScript, 250)
    );

    $('.ex-mode-menu select[name="tag-script-number"]').change(ModeMenu.switchTagScript);
    ModeMenu.setTagScriptNumber(EX.config.tagScriptNumber);

    $('.ex-mode-menu button[name="apply"]').click(ModeMenu.applyTagScript);
    $('.ex-mode-menu button[name="select-all"]').click(ModeMenu.selectAll);
    $('.ex-mode-menu button[name="select-invert"]').click(ModeMenu.invertSelection);
  }

  static initializeThumbnails() {
    $(`
      .mod-queue-preview aside a,
      div.post-preview .preview a,
      article.post-preview a
    `).click(ModeMenu.onThumbnailClick);
  }

  static initializeHotkeys() {
    $(document).keydown("1 2 3 4 5 6 7 8 9", ModeMenu.switchToTagScript);

    $(document).keydown("shift+a", ModeMenu.applyTagScript);
    $(document).keydown("ctrl+a",  ModeMenu.selectAll);
    $(document).keydown("ctrl+i",  ModeMenu.invertSelection);

    $(document).keydown("esc", e => ModeMenu.setMode("view"));
    $(document).keydown("`", e => ModeMenu.toggleMode("preview"));
    $(document).keydown("shift+`", e => ModeMenu.toggleMode("preview"));
  }

  static switchToTagScript(event) {
    const newN = Number(String.fromCharCode(event.which));
    const oldN = ModeMenu.getTagScriptNumber();

    if (ModeMenu.getMode() === "tag-script" && newN === oldN) {
      $('.ex-mode-menu input[name="tag-script"]').focus();
    } else {
      ModeMenu.setMode("tag-script");
      ModeMenu.setTagScriptNumber(newN);
    }

    event.preventDefault();
  }

  static switchMode() {
    const mode = ModeMenu.getMode();
    EX.config.modeMenuState = mode;

    $("body").removeClass((i, klass) => (klass.match(/mode-.*/) || []).join(' '));
    $("body").addClass(`mode-${mode}`);

    if (mode === "tag-script") {
      $(".ex-mode-menu .ex-tag-script-controls").show();

      $("#page").selectable({
        filter: "article.post-preview, div.post-preview .preview, .mod-queue-preview aside",
        delay: 200,
      });
    } else {
      $(".ex-mode-menu .ex-tag-script-controls").hide();

      if ($("#page").selectable("instance")) {
        $("#page").selectable("destroy");
      }
    }
  }

  static switchTagScript(event) {
    const n = ModeMenu.getTagScriptNumber();
    EX.config.tagScriptNumber = n;

    const script = EX.config.tagScripts[n];
    $('.ex-mode-menu input[name="tag-script"]').val(script).change();
  }

  static onThumbnailClick(event) {
    // Only apply on left click, not middle click and not ctrl+left click.
    if (event.ctrlKey || event.which !== 1) {
      return;
    }

    switch (ModeMenu.getMode()) {
      case "view":
        return;

      case "tag-script":
        $(event.target).closest(".ui-selectee").toggleClass("ui-selected");
        /* fallthrough */

      case "preview":
        let post = Posts.normalize($(event.target).closest(".post-preview").data());

        const html = Posts.preview(post, post.large_file_url);
        $("#ex-preview-panel article").replaceWith(html);

        PreviewPanel.setHeight();
        event.preventDefault();
        break;
    }
  }

  static applyTagScript(event) {
    const mode = ModeMenu.getMode();

    if (mode === "tag-script") {
      const tag_script = ModeMenu.getTagScript();
      $(".ui-selected").each((i, e) => {
        const post_id = $(e).closest(".post-preview").data("id");
        Danbooru.TagScript.run(post_id, tag_script);
      });
    }
  }

  static selectAll(event) {
    if ($(".ui-selected").length) {
      $(".ui-selected").removeClass("ui-selected");
    } else {
      $(".ui-selectee").addClass("ui-selected");
    }

    event.preventDefault();
  }

  static invertSelection(event) {
    let $unselected = $(".ui-selectee:not(.ui-selected)");
    let $selected = $(".ui-selectee.ui-selected");

    $unselected.addClass("ui-selected");
    $selected.removeClass("ui-selected");
  }

  static getMode() {
    return $(".ex-mode-menu select").val();
  }

  static setMode(mode) {
    $('.ex-mode-menu select[name="mode"]').val(mode).change();
  }

  static toggleMode(mode) {
    ModeMenu.setMode(ModeMenu.getMode() === mode ? "view" : mode);
  }

  static getTagScript() {
    return $('.ex-mode-menu input[name="tag-script"]').val().trim();
  }

  static saveTagScript() {
    const scripts = EX.config.tagScripts;
    scripts[ModeMenu.getTagScriptNumber()] = ModeMenu.getTagScript();
    EX.config.tagScripts = scripts;
  }

  static getTagScriptNumber() {
    return Number($('.ex-mode-menu select[name="tag-script-number"]').val());
  }

  static setTagScriptNumber(n) {
    $('.ex-mode-menu select[name="tag-script-number"]').val(n).change();
  }
}
