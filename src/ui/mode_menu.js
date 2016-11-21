/* global Danbooru */

import _ from "lodash";

import EX from "../ex.js";
import Posts from "./posts.js";
import PreviewPanel from "./preview_panel.js";

export default class ModeMenu {
  static initialize() {
    ModeMenu.uninitializeDanbooruModeMenu();
    ModeMenu.initializeModeMenu();
    ModeMenu.initializeTagScriptControls();
    ModeMenu.initializeThumbnails();
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
    const mode = _.defaultTo(EX.config.modeMenuState[EX.config.pageKey()], "view");
    ModeMenu.setMode(mode);
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
    const selector = `
      .mod-queue-preview aside a,
      div.post-preview .preview a,
      article.post-preview a
    `;

    $(document).on("click", selector, ModeMenu.onThumbnailClick);

    // Hide cursor when clicking outside of thumbnails.
    $(document).on("click", () => $(".ex-cursor").removeClass("ex-cursor"));
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

    let state = EX.config.modeMenuState;
    state[EX.config.pageKey()] = mode;
    EX.config.modeMenuState = state;

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
      return true;
    }

    // XXX prevent focused text fields from staying focused when clicking on thumbnails.
    $(":focus").blur();

    if (ModeMenu.getMode() === "view") {
      return true;
    } else {
      Selection.moveCursorTo($(event.target), { selectTarget: true, selectInterval: event.shiftKey });
      return false;
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

export class Selection {
  static get post() {
    return "article.post-preview, div.post-preview .preview, .mod-queue-preview aside";
  }

  static get $cursor() {
    return Selection.active()
         ? $(".ex-cursor")
         : $(Selection.post).first().addClass("ex-cursor");
  }

  static set $cursor($newCursor) {
    Selection.$cursor.removeClass("ex-cursor");
    return $newCursor.addClass("ex-cursor");
  }

  static active() {
    return $(".ex-cursor").length > 0;
  }

  static between($from, $to) {
    if ($from.nextAll().is($to)) {
      return $from.nextUntil($to, Selection.post).add($to).andSelf();
    } else if ($from.prevAll().is($to)) {
      return $from.prevUntil($to, Selection.post).add($to).andSelf();
    } else {
      return $();
    }
  }

  static selectBetween($from, $to) {
    return Selection.between($from, $to).addClass("ui-selected");
  }

  static deselectBetween($from, $to) {
    return Selection.between($from, $to).removeClass("ui-selected");
  }

  static moveCursor(direction, { selectInterval = false } = {}) {
    // XXX if ($(Selection.post).length === 0) {
    if (ModeMenu.getMode() === "view") {
      return true;
    }

    const post = Selection.post;
    const $cursor = Selection.$cursor;
    const firstInColumn = $posts =>
      $posts.filter((i, e) => $(e).position().left === $cursor.position().left).first();

    const $target = direction === "left"  ? $cursor.prev(post)
                  : direction === "right" ? $cursor.next(post)
                  : direction === "up"    ? firstInColumn($cursor.prevAll(post))
                  : direction === "down"  ? firstInColumn($cursor.nextAll(post))
                  : $();

    // XXX cleanup
    if ($target.length) {
      if (selectInterval) { 
        $cursor.closest(Selection.post).toggleClass("ui-selected");
      }

      Selection.moveCursorTo($target, { selectInterval });
    }
  }

  static moveCursorTo($target, { selectTarget = false, selectInterval = false } = {}) {
    const $newCursor = $target.closest(Selection.post);
    const $oldCursor = $(".ex-cursor").length
                     ? $(".ex-cursor")
                     : $newCursor;

    const $newMark = $newCursor;
    const $oldMark = $(".ex-mark").length
                   ? $(".ex-mark")
                   : $(Selection.post).first().addClass("ex-mark");

    Selection.swapCursor($oldCursor, $newCursor);
    
    if (selectTarget) {
        $newCursor.toggleClass("ui-selected");
    }

    if (selectInterval) {
        Selection.deselectBetween($oldMark, $oldCursor);
        Selection.selectBetween($oldMark, $newCursor);
    } else {
        $oldMark.removeClass("ex-mark");
        $newMark.addClass("ex-mark");
    }
  }

  static swapCursor($oldCursor, $newCursor) {
    $oldCursor.removeClass("ex-cursor");
    $newCursor.addClass("ex-cursor");

    Selection.scrollWindowTo($newCursor);
    $newCursor.find("a").focus();

    const post = Posts.normalize($newCursor.closest(".post-preview").data());
    const html = Posts.preview(post, { size: "large", classes: ["ex-no-tooltip"] });

    $("#ex-preview-panel article").replaceWith(html);
    PreviewPanel.setHeight();
  }

  static scrollWindowTo($target) {
    const targetTop = $target.position().top;
    const targetHeight = $target.height();

    if (targetTop + targetHeight > window.scrollY + window.innerHeight) {
      window.scrollTo(0, targetTop + 2*targetHeight - window.innerHeight);
    } else if (targetTop < window.scrollY) {
      window.scrollTo(0, targetTop - targetHeight);
    }
  }

  static toggleSelected() {
    if (!Selection.active()) { return true; }
    Selection.$cursor.toggleClass("ui-selected");
  }

  static open() {
    if (!Selection.active()) { return true; }
    window.location = Selection.$cursor.find("a").attr("href");
  }

  static openInNewTab() {
    if (!Selection.active()) { return true; }
    window.open(Selection.$cursor.find("a").attr("href"));
  }

  static favorite() {
    if (!Selection.active()) { return true; }

    const post = Posts.normalize(Selection.$cursor.closest(".post-preview").data());

    $.post("/favorites.json", { post_id: post.id }).then(() =>
      Danbooru.notice(`You have favorited post #${post.id}.`)
    );
  }
}
