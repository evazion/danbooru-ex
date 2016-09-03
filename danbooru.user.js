// ==UserScript==
// @name         Danbooru Power Tools
// @namespace    https://github.com/evazion/danbooru-power-tools
// @version      20160902
// @source       https://danbooru.donmai.us/users/52664
// @description  Danbooru UI Enhancements
// @author       evazion
// @match        *://*.donmai.us/*
// @grant        none
// @require      https://raw.githubusercontent.com/imgix/drift/master/dist/Drift.js
// @resource     css https://raw.githubusercontent.com/imgix/drift/master/dist/drift-basic.css
// ==/UserScript==

$(function() {
    'use strict';

    Danbooru.PostModeMenu.show_notice = function (i) {
        var current_script_id = Danbooru.Cookie.get("current_tag_script_id");
        var tag_script = Danbooru.Cookie.get("tag-script-" + current_script_id).trim();
        if (tag_script) {
            Danbooru.notice(`Switched to tag script #${i}: <a href="/posts?tags=${encodeURIComponent(tag_script)}">${tag_script}</a>. To switch tag scripts, use the number keys.`);
        } else {
            Danbooru.notice("Switched to tag script #" + i + ". To switch tag scripts, use the number keys.");
        }
    };

    /* Update Rating in sidebar when it changes. */
    var old_update_data = Danbooru.Post.update_data;
    Danbooru.Post.update_data = function(data) {
        var rating = data.rating === 's' ? "Safe"
                   : data.rating === 'q' ? "Questionable"
                   : data.rating === 'e' ? "Explicit"
                   : "Unknown";

        $("#post-information > ul > li:nth-child(6)").text(`Rating: ${rating}`);
        return old_update_data(data);
    };

    if ($("#c-posts,#c-favorites,#c-pools").length && $("#a-index").length) {
        // Disable middle-click for tag scripts.
        $(".post-preview a").off("click").click(function (e) {
            if (e.which == 1) {
                return Danbooru.PostModeMenu.click(e);
            }
        });

        var keys = {
            "v":       "view",
            "t":       "tag-script",
            "e":       "edit",
            "f":       "add-fav",
            "shift+f": "remove-fav",

            "shift+s": "rating-s",
            "shift+q": "rating-q",
            "shift+e": "rating-e",

            //"v":       "vote-up",
            //"shift+v": "vote-down",
        };

        $.each(keys, function (key, mode) {
            $(document).keydown(key, function () {
                $("#mode-box select").val(mode);
                // include (learn more) link.
                Danbooru.notice(`Switched to ${mode} mode.`);
                Danbooru.PostModeMenu.change();
            });
        });
    }

    if ($("#c-posts").length && $("#a-show").length) {
        var post_id = Danbooru.meta("post-id");

        var rate = function (post_id, rating) {
            return function (e) {
                Danbooru.Post.update(post_id, {"post[rating]": rating});
                e.preventDefault();
            };
        };

        $(document).keydown("ctrl+s", rate(post_id, 's'));
        $(document).keydown("ctrl+q", rate(post_id, 'q'));
        $(document).keydown("ctrl+e", rate(post_id, 'e'));

        $(document).keydown("x", Danbooru.Post.vote.bind(undefined, 'down', post_id));
        $(document).keydown("c", Danbooru.Post.vote.bind(undefined, 'up',   post_id));
    }

    if ($("#c-forum-topics").length && $("#a-show").length) {
        /* On forum posts, change "Permalink" to "Forum #1234" and place to the left of "Quote". */
        $(".forum-post menu").each(function (i, e) {
            var forum_id  = $(e).find("li:nth-child(1)");
            var quote     = $(e).find("li:nth-child(2)");
            var permalink = $(e).find("li:last-child");

            permalink.find("a").text(`Forum #${forum_id.text().match(/\d+/)}`);
            forum_id.remove();

            permalink.insertBefore(quote);
            $("<li>").text("|").insertAfter(permalink);
        });
    }
});
