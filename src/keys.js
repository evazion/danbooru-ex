/* global Danbooru */

import _ from "lodash";
import Mousetrap from "mousetrap";

import Header from "./ui/header.js";
import ModeMenu from "./ui/mode_menu.js";
import { Selection } from "./ui/mode_menu.js";
import Navigation from "./navigation.js";
import EX from "./ex.js";

export default class Keys {
  constructor() {
    this.actions = {};
    this.bindings = [];
  }

  register(actions = {}) {
    this.actions = _.merge({}, this.actions, actions);
    return this;
  }

  bind(bindings) {
    _(bindings).each(binding => {
      const keys = _(binding).keys().get(0);
      const action = binding[keys];
      const callback = this.actions[action];

      if (action === undefined || callback === undefined) {
        EX.debug(`[KEY] FAIL ${keys} -> ${action}`);
        return this;
      }

      Mousetrap.bind(keys, event => {
        EX.debug(`[KEY] EXEC ${keys} -> ${action} (${callback.name})`);

        return callback(event) === true;
      });

      EX.debug(`[KEY] BIND ${keys} -> ${action} (${callback.name})`);
    });

    this.bindings = _.concat(this.bindings, bindings);
    return this;
  }

  initialize() {
    // Numpad 5
    Mousetrap.addKeycodes({ 12: "clear" });

    this.register({
      "escape": Keys.escape,

      "goto-page": Navigation.gotoPage,
      "goto-last-page": Navigation.gotoLastPage,
      "goto-page-dialog": Navigation.gotoPageDialog,
      
      "go-my-account": () => window.location = `/users/${Danbooru.meta("current-user-id")}`,
      "go-my-dmails": () => window.location = "/dmails",
      "go-my-favorites": () => window.location = `/posts?tags=ordfav:${encodeURIComponent(Danbooru.meta("current-user-name"))}`,
      "go-my-saved-searches": () => window.location = `/saved_searches`,
      "go-my-settings": () => window.location = `/users/${Danbooru.meta("current-user-id")}/edit`,

      "go-artists-index": () => window.location = "/artists",
      "go-bur-new": () => window.location = "/bulk_update_requests/new",
      "go-comments-index": () => window.location = "/comments",
      "go-forum-index": () => window.location = "/forum_topics",
      "go-pools-index": () => window.location = "/pools",
      "go-post-index": () => window.location = "/posts",
      "go-wiki-index": () => window.location = "/wiki_pages",

      "go-top": Navigation.goTop,
      "go-bottom": Navigation.goBottom,
      "go-forward": Navigation.goForward,
      "go-back": Navigation.goBack,

      "header-open": Header.open,
      "header-close": Header.close,
      "header-toggle": Header.toggle,
      "header-focus-search": Header.focusSearch,
      "header-execute-search-in-new-tab": Header.executeSearchInNewTab,

      "select-all": ModeMenu.selectAll,
      "invert-selection": ModeMenu.invertSelection,
      "apply-tag-script": ModeMenu.applyTagScript,
      "switch-to-tag-script": ModeMenu.switchToTagScript,
      "set-preview-mode": () => ModeMenu.setMode("preview"),

      "move-cursor-up": e => Selection.moveCursor("up", { selectInterval: e.shiftKey }),
      "move-cursor-right": e => Selection.moveCursor("right", { selectInterval: e.shiftKey }),
      "move-cursor-down": e => Selection.moveCursor("down", { selectInterval: e.shiftKey }),
      "move-cursor-left": e => Selection.moveCursor("left", { selectInterval: e.shiftKey }),

      "cursor-open": Selection.open,
      "cursor-open-in-new-tab": Selection.openInNewTab,
      "cursor-toggle-selected": Selection.toggleSelected,

      "cursor-favorite": Selection.favorite,

      "save-search": () => $("#save-search").click(),
    });

    this.bind([
      { "q": "header-focus-search" },
      { "h o": "header-open" },
      { "h c": "header-close" },
      { "h t": "header-toggle" },
      { "h h": "header-focus-search" },

      { "S": "save-search" },

      { "g :": "goto-page-dialog" },
      { "g 0": "goto-last-page" },
      { "g 1": "goto-page" },
      { "g 2": "goto-page" },
      { "g 3": "goto-page" },
      { "g 4": "goto-page" },
      { "g 5": "goto-page" },
      { "g 6": "goto-page" },
      { "g 7": "goto-page" },
      { "g 8": "goto-page" },
      { "g 9": "goto-page" },

      { "g g": "go-top" },
      { "G":   "go-bottom" },
      { "g f": "go-forward" },
      { "g b": "go-back" },

      { "g h": "go-my-account" },
      { "g d": "go-my-dmails" },
      { "g F": "go-my-favorites" },
      { "g s": "go-my-settings" },
      { "g S": "go-my-saved-searches" },

      { "g a": "go-artists-index" },
      { "g B": "go-bur-new" },
      { "g c": "go-comments-index" },
      { "g f": "go-forum-index" },
      { "g P": "go-pools-index" },
      { "g p": "go-post-index" },
      { "g w": "go-wiki-index" },

      { "1": "switch-to-tag-script" },
      { "2": "switch-to-tag-script" },
      { "3": "switch-to-tag-script" },
      { "4": "switch-to-tag-script" },
      { "5": "switch-to-tag-script" },
      { "6": "switch-to-tag-script" },
      { "7": "switch-to-tag-script" },
      { "8": "switch-to-tag-script" },
      { "9": "switch-to-tag-script" },

      { "shift+a": "apply-tag-script" },
      { "ctrl+a": "select-all" },
      { "ctrl+i": "invert-selection" },
      { "`": "set-preview-mode" },
      { "~": "set-preview-mode" },
 
      { "up": "move-cursor-up" },
      { "right": "move-cursor-right" },
      { "down": "move-cursor-down" },
      { "left": "move-cursor-left" },

      { "shift+up": "move-cursor-up" },
      { "shift+right": "move-cursor-right" },
      { "shift+down": "move-cursor-down" },
      { "shift+left": "move-cursor-left" },

      { "return": "cursor-open" },
      { "ctrl+return": "cursor-open-in-new-tab" },
      { "space": "cursor-toggle-selected" },

      { "clear": "cursor-toggle-selected" }, // Numpad 5
      { "del": "apply-tag-script" }, // Numpad Period
      { "*": "select-all" }, // Numpad Multiply

      { "f": "cursor-favorite" },
    ]);

    // XXX don't hardcode these
    Mousetrap.bindGlobal("esc", Keys.escape);
    Mousetrap.bindGlobal("ctrl+return", Keys.submitForm);

    // XXX figure out how to unbind W/S properly.
    //$(document).unbind("keydown", "w s");
    //Mousetrap.bind("w", Keys.scroll(+1, 50, 0.06));
    //Mousetrap.bind("s", Keys.scroll(-1, 50, 0.06));
    Danbooru.Shortcuts.nav_scroll_down = Navigation.scroll(+1, 50, 0.06);
    Danbooru.Shortcuts.nav_scroll_up   = Navigation.scroll(-1, 50, 0.06);
  }

  /* Actions */

  static escape(event) {
    const $target = $(event.target);
    
    if ($target.is("input, textarea")) {
      $target.blur();
    } else {
      $('#close-notice-link').click();
      // XXX only do if no notice and not already in view mode.
      ModeMenu.setMode("view");
    }

    // Allow event to bubble up so that escape still closes jquery UI dialogs.
    return true;
  }

  static submitForm(event) {
    const $target = $(event.target);

    if ($target.is("#ex-tags:focus")) {
      Header.executeSearchInNewTab();
    } else if ($target.is("input, textarea")) {
      $target.closest("form").find('input[type="submit"][value="Submit"]').click();
    }

    return false;
  }
}
