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
    // - Add hotkey:
    // -- E: edit pool.
    function open_edit_page (controller) {
        // FIXME: Get the ID from the 'Show' link. This is brittle.
        const $show_link =
            $('#nav > menu:nth-child(2) a')
            .filter((i, e) => $(e).text().match(/^Show$/));

        const id =
            $show_link.attr('href').match(new RegExp(`/${controller}/(\\d+)$`))[1];

        window.location.href = `/${controller}/${id}/edit`;
    }

    if ($("#c-pools").length && $("#a-show").length) {
        $(document).keydown("e", e => open_edit_page('pools'));
    }

    if ($("#c-artists").length && $("#a-show").length) {
        $(document).keydown("e", e => open_edit_page('artists'));
    }

    // /wiki_pages:
    // - Make headings collapsible.
    // - Add a table of contents to long wiki pages.
    if ($("#c-wiki-pages").length) {
      EX.UI.WikiPages.initialize_collapsible_headings();
      EX.UI.WikiPages.initialize_table_of_contents();
    }
});
