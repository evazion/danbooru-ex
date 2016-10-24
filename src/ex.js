import _ from "lodash";
import jQuery from "jquery";
import moment from "moment";

import DText from "./dtext.js";
import Tag   from "./tag.js";
import UI    from "./ui.js";
import "./danbooru-ex.css";

export default class EX {
  static search(url, data, success) {
    return $.getJSON(url, { search: data, limit: 1000 }, success);
  }
}

EX.DText = DText;
EX.Tag = Tag;
EX.UI = UI;

EX.initialize = function () {
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

window.EX = EX;
jQuery(function () {
  "use strict";
  EX.initialize();
});
