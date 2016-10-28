import _ from "lodash";
import jQuery from "jquery";
import moment from "moment";
import Dexie from "dexie";

import DText from "./dtext.js";
import Tag   from "./tag.js";
import UI    from "./ui.js";
import "./danbooru-ex.css";

export default class EX {
  static get DText() { return DText; }
  static get Tag() { return Tag; }
  static get UI() { return UI; }

  static search(url, search, { limit, page } = {}) {
    return $.getJSON(url, { search, limit: limit || 1000, page: page || 1 });
  }
}

  static initialize() {
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
  "use strict";
  EX.initialize();
});
