import $ from "jquery";

import Config from "./config.js";
import DText from "./dtext.js";
import Keys from "./keys.js";
import Resource from "./resource.js";
import UI from "./ui.js";
import "./danbooru-ex.scss";

export default window.EX = class EX {
  static get Config() { return Config; }
  static get DText() { return DText; }
  static get Keys() { return Keys; }
  static get Resource() { return Resource; }
  static get UI() { return UI; }

  static get logLevel() { return 1; }

  static initialize() {
    // console.timeEnd("preinit");
    // console.groupCollapsed("settings");

    EX.version = GM_info.script.version;
    EX.config = new EX.Config();
    EX.keys = new EX.Keys();

    if (EX.config.enableHotkeys) { EX.keys.initialize(); }

    EX.config.enableHeader && UI.Header.initialize();
    EX.config.resizeableSidebars && UI.Sidebar.initialize();
    EX.config.showThumbnailPreviews && UI.PostPreviews.initializeThumbnailPreviews();
    // EX.config.showPostLinkPreviews && UI.PostPreviews.initializePostLinkPreviews();
    EX.UI.initialize();
    EX.config.enableNotesLivePreview && EX.UI.Notes.initialize();
    EX.config.usernameTooltips && EX.UI.Users.initializeUserTooltips();
    EX.config.enableLargeThumbnails && EX.UI.Posts.initializeLargeThumbnails();

    EX.config.artistsRedesign && EX.UI.Artists.initialize();
    EX.config.commentsRedesign && EX.UI.Comments.initialize();
    EX.config.forumRedesign && EX.UI.ForumPosts.initialize();
    EX.config.postsRedesign && EX.UI.Posts.initialize();
    EX.config.postVersionsRedesign && EX.UI.PostVersions.initialize();
    EX.config.wikiRedesign && EX.UI.WikiPages.initialize();
    EX.config.usersRedesign && EX.UI.Users.initialize();
    // EX.UI.SavedSearches.initialize();

    // console.groupEnd("settings");
    // console.timeEnd("initialized");
  }

  static debug(...params) {
    if (EX.logLevel === 0) {
      console.log(...params);
    }
  }
}

window.EX.debug("Danbooru:", window.Danbooru);
// console.timeEnd("loaded");

$(function () {
  try {
    window.EX.initialize();
  } catch(e) {
    console.trace(e);
    $("footer").append(`<div class="ex-error">Danbooru EX error: ${e}</div>`);
    throw e;
  }
});
