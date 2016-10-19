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

    // HACK: "Show all comments" replaces the comment list's HTML then
    // initializes all the reply/edit/vote links. We hook into that
    // initialization here so we can add in our own metadata at the same time.
    Danbooru.Comment.initialize_vote_links = function ($parent) {
        $parent = $parent || $(document);
        $parent.find(".unvote-comment-link").hide();

        Danbooru.Comment.initialize_metadata($parent);
    };

    // Display the new tag script in the popup notice when switching tag scripts.
    Danbooru.PostModeMenu.show_notice = function (i) {
        let current_script_id = Danbooru.Cookie.get("current_tag_script_id");
        let tag_script = Danbooru.Cookie.get(`tag-script-${current_script_id}`).trim();
        if (tag_script) {
            Danbooru.notice(`Switched to tag script #${i}: <a href="/posts?tags=${encodeURIComponent(tag_script)}">${tag_script}</a>. To switch tag scripts, use the number keys.`);
        } else {
            Danbooru.notice(`Switched to tag script #${i}. To switch tag scripts, use the number keys.`);
        }
    };

    // Update Rating in sidebar when it changes.
    var old_update_data = Danbooru.Post.update_data;
    Danbooru.Post.update_data = function(data) {
        var rating = data.rating === 's' ? "Safe"
                   : data.rating === 'q' ? "Questionable"
                   : data.rating === 'e' ? "Explicit"
                   : "Unknown";

        $("#post-information > ul > li:nth-child(6)").text(`Rating: ${rating}`);
        return old_update_data(data);
    };

    // Prevent middle-click from adding tag when clicking on related tags (open
    // a new tab instead).
    const old_toggle_tag = Danbooru.RelatedTag.toggle_tag;
    Danbooru.RelatedTag.toggle_tag = function (e) {
        if (e.which === 1) {
            return old_toggle_tag(e);
        }
    };

    const old_postmodemenu_change = Danbooru.PostModeMenu.change;
    Danbooru.PostModeMenu.change = function () {
        const mode = $("#mode-box select").val();

        if (mode !== "view") {
            // Only apply tag script on left click, not middle click and not
            // ctrl+left click.
            $("article.post-preview a").off("click").click(function (e) {
                if (e.which == 1 && e.ctrlKey === false) {
                    return Danbooru.PostModeMenu.click(e);
                }
            });

            // Enable selectable thumbnails.
            $("#page").selectable({
                filter: "article.post-preview",
                delay: 300
            });
        }

        return old_postmodemenu_change();
    };

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

    EX.UI.initialize_post_thumbnails();
    EX.UI.initialize_user_links();
    EX.UI.initialize_wiki_links();

    EX.UI.initialize_header();
    EX.UI.initialize_relative_times();

    EX.UI.ModeMenu.initialize();

    if ($("#c-posts").length && $("#a-show").length) {
      EX.UI.Posts.initialize_artist_tags();
      EX.UI.Posts.initialize_tag_type_count();
      EX.UI.Posts.initialize_hotkeys();
    }

    // Show thumbnails in post changes listing.
    if ($("#c-post-versions").length && $("#a-index").length) {
      EX.UI.PostVersions.initialize_thumbnails();
    }

    if ($("#c-comments").length || ($("#c-posts").length && $("#a-show").length)) {
      EX.UI.Comments.initialize_metadata();
    }

    if ($("#c-comments").length && $("#a-index").length) {
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

    EX.UI.initialize_hotkeys();
});
