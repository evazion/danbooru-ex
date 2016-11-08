import jQuery from "jquery";
import moment from "moment";

import Config from "./config.js";
import DText from "./dtext.js";
import Resource from "./resource.js";
import UI from "./ui.js";
import "./danbooru-ex.scss";

export default class EX {
  static get Config() { return Config; }
  static get DText() { return DText; }
  static get Resource() { return Resource; }
  static get UI() { return UI; }

  static search(url, search, { limit, page } = {}) {
    return $.getJSON(url, { search, limit: limit || 1000, page: page || 1 });
  }

  static initialize() {
    $("footer").append(
      `| Danbooru EX <a href="https://github.com/evazion/danbooru-ex">v${GM_info.script.version}</a> – <a href="/users/${$('meta[name="current-user-id"]').attr("content")}/edit#ex-settings">Settings</a>`
    );

    EX.config.enableHeader && UI.Header.initialize();

    EX.UI.initialize();
    EX.config.enableNotesLivePreview && EX.UI.Notes.initialize();
    EX.config.usernameTooltips && EX.UI.Users.initialize();

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

console.timeEnd("loaded");
$(function () {
  try {
    console.timeEnd("preinit");

    EX.config = new EX.Config();
    EX.initialize();

    console.timeEnd("initialized");
  } catch(e) {
    console.trace(e);
    $("footer").append(`<div class="ex-error">Danbooru EX error: ${e}</div>`);
    throw e;
  }
});
