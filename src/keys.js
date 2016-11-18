/* global Danbooru */

import _ from "lodash";
import Mousetrap from "mousetrap";

import Header from "./ui/header.js";
import ModeMenu from "./ui/mode_menu.js";

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
        console.log(`[KEY] FAIL ${keys} -> ${action}`);
        return this;
      }

      Mousetrap.bind(keys, (...args) => {
        console.log(`[KEY] EXEC ${keys} -> ${action} (${callback.name})`);
        return callback(...args);
      });

      console.log(`[KEY] BIND ${keys} -> ${action} (${callback.name})`);
    });

    this.bindings = _.concat(this.bindings, bindings);
    return this;
  }

  initialize() {
    this.register({
      "escape": Keys.escape,

      "goto-page": Keys.gotoPage,
      "goto-last-page": Keys.gotoLastPage,

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
    });

    this.bind([
      { "q": "header-focus-search" },
      // XXX { "mod enter": "header-execute-search-in-new-tab" },
      { "h o": "header-open" },
      { "h c": "header-close" },
      { "h t": "header-toggle" },
      { "h h": "header-focus-search" },

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
    ]);

    // XXX don't hardcode these
    Mousetrap.bindGlobal("esc", Keys.escape);
    Mousetrap.bindGlobal("ctrl+return", Keys.submitForm);

    // XXX figure out how to unbind W/S properly.
    //$(document).unbind("keydown", "w s");
    //Mousetrap.bind("w", Keys.scroll(+1, 50, 0.06));
    //Mousetrap.bind("s", Keys.scroll(-1, 50, 0.06));
    Danbooru.Shortcuts.nav_scroll_down = Keys.scroll(+1, 50, 0.06);
    Danbooru.Shortcuts.nav_scroll_up   = Keys.scroll(-1, 50, 0.06);
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

    if ($target.is("input, textarea")) {
      $target.closest("form").find('input[type="submit"][value="Submit"]').click();
    }

    return false;
  }

  static gotoPage(event) {
    Keys.gotoPageN(Number(event.key));
  }

  static gotoLastPage(event) {
    // a:not(a[rel]) - exclude the Previous/Next links seen in the paginator on /favorites et al.
    const n = $('div.paginator li:nth-last-child(2) a:not(a[rel])').first().text();

    if (n) {
      Keys.gotoPageN(n);
    }
  }

  static gotoPageN(n) {
    if (location.search.match(/page=(\d+)/)) {
      location.search = location.search.replace(/page=(\d+)/, `page=${n}`);
    } else {
      location.search += `&page=${n}`;
    }
  }

  static scroll(direction, duration, distance) {
    return _.throttle(() => {
      const top = $(window).scrollTop() + direction * $(window).height() * distance;
      $('html, body').animate({scrollTop: top}, duration, "linear");
    }, duration);
  }
}
