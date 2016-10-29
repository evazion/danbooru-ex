import _ from "lodash";
import jQuery from "jquery";
import moment from "moment";

import Config from "./config.js";
import DText from "./dtext.js";
import Tag   from "./tag.js";
import UI    from "./ui.js";
import "./danbooru-ex.css";

export default class EX {
  static get Config() { return Config; }
  static get DText() { return DText; }
  static get Tag() { return Tag; }
  static get UI() { return UI; }

  static search(url, search, { limit, page } = {}) {
    return $.getJSON(url, { search, limit: limit || 1000, page: page || 1 });
  }

  static initialize() {
    EX.config = new Config();
    EX.UI.initialize();
    EX.UI.Artists.initialize();
    EX.UI.Comments.initialize();
    EX.UI.ForumPosts.initialize();
    EX.UI.ModeMenu.initialize();
    EX.UI.Pools.initialize();
    EX.UI.Posts.initialize();
    EX.UI.PostVersions.initialize();
    EX.UI.WikiPages.initialize();
  }
}

window.EX = EX;
jQuery(function () {
  try {
    EX.initialize();
  } catch(e) {
    $("footer").append(`<div class="ex-error">Danbooru EX error: ${e}</div>`);
    throw e;
  }
});
