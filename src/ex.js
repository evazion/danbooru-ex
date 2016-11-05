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
    $("footer").append(
      ` – Danbooru EX (<a href="/users/${$('meta[name="current-user-id"]').attr("content")}/edit#ex-settings">settings</a>)`
    );

    EX.config.enableHeader && UI.Header.initialize();

    EX.UI.initialize();
    EX.config.enableNotesLivePreview && EX.UI.Notes.initialize();

    EX.config.artistsRedesign && EX.UI.Artists.initialize();
    EX.config.commentsRedesign && EX.UI.Comments.initialize();
    EX.config.forumRedesign && EX.UI.ForumPosts.initialize();
    EX.config.poolsRedesign && EX.UI.Pools.initialize();
    EX.config.postsRedesign && EX.UI.Posts.initialize();
    EX.config.postVersionsRedesign && EX.UI.PostVersions.initialize();
    EX.config.wikiRedesign && EX.UI.WikiPages.initialize();
  }
}

window.EX = EX;
window.moment = moment;

jQuery(function () {
  try {
    EX.config = new EX.Config();
    EX.initialize();
  } catch(e) {
    $("footer").append(`<div class="ex-error">Danbooru EX error: ${e}</div>`);
    throw e;
  }
});
