import _ from "lodash";
import jQuery from "jquery";
import moment from "moment";

import "./danbooru-ex.css";
import EX from "./ex.js";
window.EX = EX;

jQuery(function() {
    'use strict';

    /*
     * Monkey patches for Danbooru's JS API.
     */

    /*
     * Global tweaks.
     * - Style banned users and approvers.
     * - Use relative times everywhere.
     * - Show thumbnails when hovering over post #1234 links.
     * - Color code tags everywhere.
     * - Add search bar to site header.
     * - Add mode menu to site header.
     * - Add mode menu hotkeys:
     * -- V: Switch to view mode (the default).
     * -- T: Switch to tag script mode.
     * -- Shift+E: Switch to edit mode.
     * -- U: Switch to vote up mode.
     * -- Alt+U: Switch to vote down mode.
     * -- F: Switch to add favorite mode.
     * -- Alt+F: Switch to remove favorite mode.
     * -- Alt+S: Switch to rate safe mode.
     * -- Alt+Q: Switch to rate questionable mode.
     * -- Alt+E: Switch to rate explicit mode.
     */

    EX.UI.initialize();
    EX.UI.ModeMenu.initialize();

    if ($("#c-posts #a-show").length) {
      EX.UI.Posts.initialize();
    }

    // Show thumbnails in post changes listing.
    if ($("#c-post-versions").length && $("#a-index").length) {
      EX.UI.PostVersions.initialize_thumbnails();
    }

    if ($("#c-comments").length || ($("#c-posts #a-show").length)) {
      EX.UI.Comments.initialize();
    }

    if ($("#c-comments #a-index").length) {
      EX.UI.Comments.initialize_tag_list();
    }

    EX.UI.ForumPosts.initialize_permalinks();

    // /pools/1234 & /artists/1234
    // - E: edit pool.
    EX.UI.Pools.initialize();
    EX.UI.Artists.initialize();

    // /wiki_pages:
    // - Make headings collapsible.
    // - Add a table of contents to long wiki pages.
    if ($("#c-wiki-pages").length) {
      EX.UI.WikiPages.initialize_collapsible_headings();
      EX.UI.WikiPages.initialize_table_of_contents();
    }
});
