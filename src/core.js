import filesize from "filesize";

import "./danbooru-ex.css";
import EX from "./ex.js";

jQuery(function() {
    'use strict';

    /*
     * Extensions to Danbooru's JS API.
     */

    Danbooru.Dtext.create_expandable = function (name, content) {
        const $expandable = $(`
            <div class="expandable">
                <div class="expandable-header">
                    <span>${_.escape(name)}</span>
                    <input type="button" value="Show" class="expandable-button">
                </div>
                <div class="expandable-content" style="display: none">
                    ${content}
                </div>
            </div>
        `);

        $expandable.find('.expandable-button').click(e => {
            $(e.target).closest('.expandable').find('.expandable-content').fadeToggle('fast');
            $(e.target).val((_, val) => val === 'Show' ? 'Hide' : 'Show');
        });

        return $expandable;
    };

    // Generate the post thumbnail HTML.
    Danbooru.Post.preview = function (post) {
        let preview_class = "post-preview";

        preview_class += post.is_pending           ? " post-status-pending"      : "";
        preview_class += post.is_flagged           ? " post-status-flagged"      : "";
        preview_class += post.is_deleted           ? " post-status-deleted"      : "";
        preview_class += post.parent_id            ? " post-status-has-parent"   : "";
        preview_class += post.has_visible_children ? " post-status-has-children" : "";

        const data_attributes = `
            data-id="${post.id}"
            data-has-sound="${!!post.tag_string.match(/(video_with_sound|flash_with_sound)/)}"
            data-tags="${_.escape(post.tag_string)}"
            data-pools="${post.pool_string}"
            data-uploader="${_.escape(post.uploader_name)}"
            data-approver-id="${post.approver_id}"
            data-rating="${post.rating}"
            data-width="${post.image_width}"
            data-height="${post.image_height}"
            data-flags="${post.status_flags}"
            data-parent-id="${post.parent_id}"
            data-has-children="${post.has_children}"
            data-score="${post.score}"
            data-views="${post.view_count}"
            data-fav-count="${post.fav_count}"
            data-pixiv-id="${post.pixiv_id}"
            data-md5="${post.md5}"
            data-file-ext="${post.file_ext}"
            data-file-url="${post.file_url}"
            data-large-file-url="${post.large_file_url}"
            data-preview-file-url="${post.preview_file_url}"
        `;

        const tag_params = "";

        return `
            <article itemscope itemtype="http://schema.org/ImageObject"
                     id="post_${post.id}" class="${preview_class}" ${data_attributes}>
                <a href="/posts/${post.id}${tag_params}">
                    <img itemprop="thumbnailUrl"
                         src="${post.preview_file_url}"
                         alt="${_.escape(post.tag_string)}">
                </a>
            </article>
        `;
    };

    // Go to page N.
    Danbooru.Paginator.goto = function (n) {
        if (location.search.match(/page=(\d+)/)) {
            location.search = location.search.replace(/page=(\d+)/, `page=${n}`);
        } else {
            location.search += `&page=${n}`;
        }
    };

    // Apply current mode to all selected posts.
    Danbooru.PostModeMenu.apply_mode = function (e) {
        $(".ui-selected").each(function (i, e) {
            var s = $("#mode-box select").val();
            var post_id = $(e).data('id');

            if (s === "add-fav") {
                Danbooru.Favorite.create(post_id);
            } else if (s === "remove-fav") {
                Danbooru.Favorite.destroy(post_id);
            } else if (s === "edit") {
                Danbooru.PostModeMenu.open_edit(post_id);
            } else if (s === 'vote-down') {
                Danbooru.Post.vote("down", post_id);
            } else if (s === 'vote-up') {
                Danbooru.Post.vote("up", post_id);
            } else if (s === 'rating-q') {
                Danbooru.Post.update(post_id, {"post[rating]": "q"});
            } else if (s === 'rating-s') {
                Danbooru.Post.update(post_id, {"post[rating]": "s"});
            } else if (s === 'rating-e') {
                Danbooru.Post.update(post_id, {"post[rating]": "e"});
            } else if (s === 'lock-rating') {
                Danbooru.Post.update(post_id, {"post[is_rating_locked]": "1"});
            } else if (s === 'lock-note') {
                Danbooru.Post.update(post_id, {"post[is_note_locked]": "1"});
            } else if (s === 'approve') {
                Danbooru.Post.approve(post_id);
            } else if (s === "tag-script") {
                var current_script_id = Danbooru.Cookie.get("current_tag_script_id");
                var tag_script = Danbooru.Cookie.get("tag-script-" + current_script_id);
                Danbooru.TagScript.run(post_id, tag_script);
            } else {
                return;
            }
        });

        e.preventDefault();
    };

    // Toggle post selection between all or none.
    Danbooru.PostModeMenu.select_all = function (e) {
        if ($('.ui-selected').length) {
            $('.ui-selected').removeClass('ui-selected');
        } else {
            $('.post-preview').addClass('ui-selected');
        }

        e.preventDefault();
    };

    /*
     * Color code tags linking to wiki pages. Also add a tooltip showing the
     * tag creation date and post count.
     */
    Danbooru.WikiPage.initialize_wiki_links = function () {
        const $wiki_links = $(`a[href^="/wiki_pages/show_or_new?title="]`);

        const tag_names = $wiki_links.map((i, e) =>
            decodeURIComponent($(e).attr('href').match(/^\/wiki_pages\/show_or_new\?title=(.*)/)[1])
        ).toArray();

        // Collect tags in batches, with each batch having a max count of 1000
        // tags or a max combined size of 6500 bytes for all tags. This is
        // necessary because these are the API limits for the /tags.json call.
        //
        // FIXME: Technically, tag.length counts UTF-16 codepoints here when we
        // should be counting bytes.
        //
        // Ref: http://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
        const [tag_batches,,] = tag_names.reduce(
            ([tags, tag_size, tag_count], tag) => {
                tag_size += tag.length;
                tag_count++;

                if (tag_count > 1000 || tag_size > 6500) {
                    tags.unshift([tag]);
                    tag_count = 0;
                    tag_size = 0;
                } else {
                    tags[0].push(tag);
                }

                return [tags, tag_size, tag_count];
            },
            [ [[]], 0, 0 ] /* tags = [[]], tag_size = 0, tag_count = 0 */
        );

        // Fetch tag data for each batch of tags, then categorize them and add tooltips.
        tag_batches.forEach(tag_batch => {
            const tag_query = encodeURIComponent(tag_batch.join(','));

            $.getJSON(`/tags.json?search[hide_empty]=no&search[name]=${tag_query}&limit=1000`).then(tags => {
                _.each(tags, tag => {
                    // Encode some extra things manually because Danbooru
                    // encodes these things in URLs but encodeURIComponent doesn't.
                    const tag_name =
                        encodeURIComponent(tag.name)
                        .replace(/!/g,  '%21')
                        .replace(/'/g,  '%27')
                        .replace(/\(/g, '%28')
                        .replace(/\)/g, '%29')
                        .replace(/~/g,  '%7E');

                    const tag_created_at =
                        moment(tag.created_at).format('MMMM Do YYYY, h:mm:ss a');

                    const tag_title =
                        `${EX.Tag.categories[tag.category]} tag #${tag.id} - ${tag.post_count} posts - created on ${tag_created_at}`;

                    $(`a[href="/wiki_pages/show_or_new?title=${tag_name}"]`)
                        .addClass(`tag-type-${tag.category}`)
                        .attr('title', tag_title);
                });
            });
        });
    };

    // Add scores and comment #1234 links to all comments in $parent.
    Danbooru.Comment.initialize_metadata = function ($parent) {
        $parent = $parent || $(document);

        $parent.find('.comment').each((i, e) => {
            const $menu = $(e).find('menu');

            const post_id = $(e).data('post-id');
            const comment_id = $(e).data('comment-id');
            const comment_score = $(e).data('score');

            const $upvote_link = $menu.find(`#comment-vote-up-link-for-${comment_id}`);
            const $downvote_link = $menu.find(`#comment-vote-down-link-for-${comment_id}`);

            if ($menu.children().length > 0) {
                $menu.append($('<li> | </li>'));
            }

            /*
            const $score_container = $('<li></li>');

            $score_container.append($(`
                <span class="info">
                    <strong>Score</strong>
                    <span>${comment_score}</span>
                </span>
            `));

            $score_container.append(document.createTextNode('(vote '));
            $upvote_link.find('a').appendTo($score_container).text('up');
            $score_container.append(document.createTextNode('/'));
            $downvote_link.find('a').appendTo($score_container).text('down');
            $score_container.append(document.createTextNode(')'));

            $menu.append($score_container);
            */

            $menu.append($(`
                <li>
                    <a href="/posts/${post_id}#comment-${comment_id}">Comment #${comment_id}</a>
                </li>
            `));

            $menu.append($(`
                <span class="info">
                    <strong>Score</strong>
                    <span>${comment_score}</span>
                </span>
            `));
        });
    };

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

    // Add data attributes to usernames so that banned users and approvers can be styled.
    const user_ids =
        _($('a.with-style[href^="/users"]'))
        .map(e => $(e).attr('href').replace("/users/", ""))
        .map(Number)
        .sortBy()
        .sortedUniq()
        .join(',');

    $.getJSON(`/users.json?limit=1000&search[id]=${user_ids}`).then(users => {
        for (const user of users) {
            let $user = $(`a.with-style[href^="/users/${user.id}"]`);

            // $user.addClass(`user-${user.level_string.toLowerCase()}`);

            _(user).forOwn((value, key) =>
                $user.attr(`data-${_(key).kebabCase()}`, value)
            );
        }
    });

    // Use relative times everywhere.
    const ABS_DATE = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
    const abs_dates = $('time').filter((i, e) => $(e).text().match(ABS_DATE));

    abs_dates.each((i, e) => {
        const time_ago = moment($(e).attr('datetime')).fromNow();
        $(e).text(time_ago);
    });

    /*
     * Show thumbnails on hovering over post #1234 links.
     */

    // Add a class to 'post #1234' links so $(document).tooltip() can find them.
    $('a[href^="/posts/"]')
        .filter((i, e) => /post #\d+/.test($(e).text()))
        .addClass('dtext-post');

    // Enable tooltips for post #1234 links. Fetch thumbnail URL on tooltip open.
    $(document).tooltip({
        items: '.dtext-post',
        // content: '<img src="http://danbooru.donmai.us/data/d68a1f25d17ca14afc14ef2335b61d2a.gif"></img>',
        content: ' ',
        open: (e, ui) => {
            const id = $(e.toElement).attr('href').match(/\/posts\/(\d+)/)[1];

            $.getJSON(`/posts/${id}.json`).then(post => {
                $(ui.tooltip).html(`<img src=${post.preview_file_url}></img>`);
            });
        }
    });

    /*
     * Color code all tags linking to the wiki.
     */

    Danbooru.WikiPage.initialize_wiki_links();

    /*
     * Add sticky header.
     */

    var $sticky = $(`
        <header id="sticky-header">
            <h1><a href="/">Danbooru</a></h1>
            <form id="search-box" action="/posts" accept-charset="UTF-8" method="get">
                <input name="utf8" type="hidden" value="✓">
                <input type="text" name="tags" id="tags" size="20" class="ui-autocomplete-input" autocomplete="off">
                <input type="submit" value="Go">
            </form>
            <section id="mode-box">
                <form action="/">
                    <select name="mode">
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                        <option value="tag-script">Tag script</option>
                        <option value="add-fav">Favorite</option>
                        <option value="remove-fav">Unfavorite</option>
                        <option value="rating-s">Rate safe</option>
                        <option value="rating-q">Rate questionable</option>
                        <option value="rating-e">Rate explicit</option>
                        <option value="vote-up">Vote up</option>
                        <option value="vote-down">Vote down</option>
                        <option value="lock-rating">Lock rating</option>
                        <option value="lock-note">Lock notes</option>
                    </select>
                </form>
                <input id="tag-script-field" placeholder="Enter tag script" style="display: none; margin-top: 0.5em;">
                <button type="button">Apply</button>
            </section>
        </header>
    `).insertBefore("#top");

    // Initalize sticky header search box.
    $("#sticky-header #tags").val($("#sidebar #tags").val());

    /*
     * Use the mode menu everywhere *but* on /posts/show (so as to not
     * interfere with existing keyboard shortcuts on that page).
     */
    if (! ($("#c-posts").length && $("#a-show").length)) {
        Danbooru.PostModeMenu.initialize_selector();
        Danbooru.PostModeMenu.initialize_preview_link();
        Danbooru.PostModeMenu.initialize_edit_form();
        Danbooru.PostModeMenu.initialize_tag_script_field();
        Danbooru.PostModeMenu.initialize_shortcuts();
        Danbooru.PostModeMenu.change();

        $('#sticky-header .mode-box button').click(Danbooru.PostModeMenu.apply_mode);

        $(document).bind('keydown', 'ctrl+a',  Danbooru.PostModeMenu.select_all);
        $(document).bind('keydown', 'shift+a', Danbooru.PostModeMenu.apply_mode);

        const keys = {
            "v":     "view",
            "t":     "tag-script",
            "f":     "add-fav",
            "alt+f": "remove-fav",
            "shift+e": "edit",

            "alt+s": "rating-s",
            "alt+q": "rating-q",
            "alt+e": "rating-e",

            "u":     "vote-up",
            "alt+u": "vote-down",
        };

        $.each(keys, function (key, mode) {
            $(document).keydown(key, function (e) {
                const prev_mode = $("#mode-box select").val();
                $("#mode-box select").val(mode);

                if (mode === "tag-script") {
                    let $tag_script_field = $("#tag-script-field").first();

                    /* Focus and select all in tag script entry box. */
                    if (prev_mode === "tag-script") {
                        $tag_script_field.focus().selectRange(0, $tag_script_field.val().length);
                        $tag_script_field.focus();
                    }
                    /*
                    if ($tag_script_field.val().length) {
                        $tag_script_field.val((i, v) => v.replace(/\s*$/, ' '));
                    }
                    */
                }

                Danbooru.notice(`Switched to ${mode} mode.`);
                Danbooru.PostModeMenu.change();

                e.preventDefault();
            });
        });
    }

    /*
     * /posts/1234:
     * - Alt+S: Rate Safe.
     * - Alt+Q: Rate Questionable.
     * - Alt+E: Rate Explicit.
     * - U / Alt+U: Vote up / vote down.
     */

    if ($("#c-posts").length && $("#a-show").length) {
        // Move artist tags to the top of the tag list.
        let $artist_h2 = $('#tag-list h2').filter((i, e) => $(e).text().match(/Artist/));
        let $artist_tags = $artist_h2.next('ul');

        $("#tag-list").prepend($artist_tags).prepend($artist_h2);

        // Add tag counts to the artist/copyright/characters headers.
        $("#tag-list h1, #tag-list h2").wrap('<span class="tag-list-header">');
        $('#tag-list .tag-list-header').each((i, e) => {
            const tag_count = $(e).next('ul').children().size();
            $(e).append(`<span class="post-count">${tag_count}</span>`);
        });

        let post_id = Danbooru.meta("post-id");

        let rate = function (post_id, rating) {
            return function (e) {
                Danbooru.Post.update(post_id, {"post[rating]": rating});
                e.preventDefault();
            };
        };

        $(document).keydown("alt+s", rate(post_id, 's'));
        $(document).keydown("alt+q", rate(post_id, 'q'));
        $(document).keydown("alt+e", rate(post_id, 'e'));

        $(document).keydown("u",     e => Danbooru.Post.vote('up',   post_id));
        $(document).keydown("alt+u", e => Danbooru.Post.vote('down', post_id));
    }

    /*
     * /post_versions:
     * - Show thumbnails instead of post IDs.
     */

    /* Show thumbnails in post changes listing. */
    if ($("#c-post-versions").length && $("#a-index").length) {
        let $post_column = $('tr td:nth-child(1)');
        let post_ids = $.map($post_column, e => $(e).text().match(/(\d+).\d+/)[1] );

        let post_data = [];
        let requests = _.chunk(post_ids, 100).map(function (ids) {
            let search = 'id:' + ids.join(',');

            return $.get(`/posts.json?tags=${search}`).then(data => {
                data.forEach((post, i) => post_data[post.id] = post);
            });
        });

        Promise.all(requests).then(_ => {
            $post_column.each((i, e) => {
                let post_id = $(e).text().match(/(\d+).\d+/)[1];
                $(e).html(Danbooru.Post.preview(post_data[post_id]));
            });
        });
    }

    /*
     * Comments:
     * - Add 'comment #1234' permalink.
     * - Add comment scores.
     */

    if ($("#c-comments").length || ($("#c-posts").length && $("#a-show").length)) {
        Danbooru.Comment.initialize_metadata();
    }

    /* 
     * /comments:
     * - Sort tags by type, and put artist tags first.
     */

    if ($("#c-comments").length && $("#a-index").length) {
        const post_ids =
            $(".comments-for-post").map((i, e) => $(e).data('post-id')).toArray();

        $.getJSON(`/posts.json?tags=status:any+id:${post_ids.join(',')}`).then(posts => {
            $(".comments-for-post").each((i, comment) => {
                const post_id = $(comment).parent().data('id');
                const post = _.find(posts, { id: post_id });

                const $row = $(`<div class="row"></div>`);
                $row.append($(`
                    <span class="info">
                        <strong>Post</strong>
                        <a href="/posts/${post.id}">#${post.id}</a>
                    </span>
                `));
                $row.append($(`
                    <span class="info">
                        <strong>Size</strong>
                        <a href="${post.file_url}">${filesize(post.file_size, { round: 0 })}</a>
                        (${post.image_width}x${post.image_height})
                    </span>
                `));

                $row.append($(`
                    <span class="info">
                        <strong>Favorites</strong>
                        ${post.fav_count} (<a href="">Fav</a>)
                    </span>
                `));

                /*
                $row.append($(`
                    <span class="info">
                        <strong>Source</strong>
                        <a href="${_.escape(post.source)}">${_.escape(post.source)}</a>
                    </span>
                `));
                */

                $(comment).find('.header').prepend($row);

                const $tags =
                    $(comment)
                    .find(".category-0, .category-1, .category-3, .category-4")
                    .detach();

                // Sort tags by category, but put general tags (category 0) at the end.
                const $sorted = _.sortBy($tags, t =>
                    $(t).attr('class').replace(/category-0/, 'category-5')
                );

                $(comment).find('.list-of-tags').append($sorted);
            });
        });
    }

    /*
     * /forum_topics:
     * - Change 'Permalink' to 'Forum #1234'.
     */

    if ($("#c-forum-topics").length && $("#a-show").length) {
        /* On forum posts, change "Permalink" to "Forum #1234". */
        $(".forum-post menu").each(function (i, e) {
            let $forum_id  = $(e).find("li:nth-child(1)");
            let $quote     = $(e).find("li:nth-child(2)");
            let $permalink = $(e).find("li:last-child");

            $permalink.find("a").text(`Forum #${$forum_id.text().match(/\d+/)}`);
            $forum_id.remove();

            // Add separator only if there's something to separate.
            if ($(e).children().length > 1) {
                $permalink.before($("<li>").text("|"));
            }
        });
    }

    /*
     * /pools/1234 & /artists/1234
     * - Add hotkey:
     * -- E: edit pool.
     */

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

    /*
     * /wiki_pages:
     * - Make headings collapsible.
     * - Add a table of contents to long wiki pages.
     */

    if ($("#c-wiki-pages").length) {
        const $headings = $("#wiki-page-body").find('h1,h2,h3,h4,h5,h6');

        if ($headings.length >= 3) {
            // Add collapse/expand button to headings.
            $headings.prepend(
                $('<a class="ui-icon ui-icon-triangle-1-s collapsible-header"></a>')
            ).click(e => {
                const $button = $(e.target);

                // Collapse everything up to the next heading at the same
                // level, or up to the alias/implication list at the bottom of the page.
                $button.toggleClass('ui-icon-triangle-1-e ui-icon-triangle-1-s');
                $button.parent('h1').nextUntil('p.hint, h1').slideToggle();
                $button.parent('h2').nextUntil('p.hint, h1, h2').slideToggle();
                $button.parent('h3').nextUntil('p.hint, h1, h2, h3').slideToggle();
                $button.parent('h4').nextUntil('p.hint, h1, h2, h3, h4').slideToggle();
                $button.parent('h5').nextUntil('p.hint, h1, h2, h3, h4, h5').slideToggle();
                $button.parent('h6').nextUntil('p.hint, h1, h2, h3, h4, h5, h6').slideToggle();
            });

            // Add Table of Contents expandable.
            const $toc = Danbooru.Dtext.create_expandable('Table of Contents', '<ul></ul>').prependTo('#wiki-page-body');

            /* 
             * Build ToC. Create a nested heirarchy matching the hierarchy of
             * headings on the page; an h5 following an h4 opens a new submenu,
             * another h4 closes the submenu. Likewise for h5, h6, etc.
             */

            let $submenu = null;
            let $menu = $toc.find('ul');
            let level = $headings.length > 0
                      ? parseInt($headings.first().get(0).tagName[1])
                      : undefined;

            $headings.each((i, e) => {
                const header = $(e).text();
                const anchor = 'dtext-' + header.toLowerCase()
                                                .replace(/[^a-z]+/g, '-')
                                                .replace(/^-|-$/, '');

                const next_level = parseInt(e.tagName[1]);
                if (next_level > level) {
                    $submenu = $('<ul></ul>');
                    $menu.append($submenu);
                    $menu = $submenu;
                } else if (next_level < level) {
                    $menu = $menu.parent();
                }

                $(e).attr('id', anchor);
                $menu.append($(
                    `<li><a href="#${anchor}">${header}</a></li>`
                ));

                level = next_level;
            });
        }
    }

    /*
     * Global keybindings.
     * - Escape: Close notice popups.
     * - W: Smooth scroll up.
     * - S: Smooth scroll down.
     * - Shift+Q: Focus top search bar.
     */

    // Escape: Close notice popups.
    $(document).keydown('esc', e => $('#close-notice-link').click());

    // Escape: Unfocus text entry field.
    $('#tag-script-field').attr('type', 'text');
    $('input[type=text],textarea').keydown('esc', e => $(e.currentTarget).blur());

    let scroll = (direction, duration, distance) => 
        _.throttle(() => {
            const top = $(window).scrollTop() + direction * $(window).height() * distance;
            $('html, body').animate({scrollTop: top}, duration, "linear");
        }, duration);
    /*
    Danbooru.Shortcuts.nav_scroll_down =
        () => Danbooru.scroll_to($(window).scrollTop() + $(window).height() * 0.15);
    Danbooru.Shortcuts.nav_scroll_up =
        () => Danbooru.scroll_to($(window).scrollTop() - $(window).height() * 0.15);
    */

    // Enable smooth scrolling with W/S keys.
    Danbooru.Shortcuts.nav_scroll_down = scroll(+1, 50, 0.06);
    Danbooru.Shortcuts.nav_scroll_up   = scroll(-1, 50, 0.06);

    /* Q: Focus search box. */
    /* XXX: Doesn't override site keybinding. */
    /*
    $(document).keydown("keydown", "q", e => {
        let $input = $("#tags, #search_name, #search_name_matches, #query").first();
        console.log($input);

        // Add a space to end if box is non-empty and doesn't already have trailing space.
        $input.val().length && $input.val((i, v) => v.replace(/\s*$/, ' '));
        $input.first().trigger("focus").selectEnd();

        e.preventDefault();
    });
    */

    // Shift+Q: Focus and select all in search box.
    $(document).keydown('shift+q', e => {
        let $input = $("#tags, #search_name, #search_name_matches, #query").first();

        // Add a space to end if  box is non-empty and doesn't already have trailing space.
        $input.val().length && $input.val((i, v) => v.replace(/\s*$/, ' '));
        $input.focus().selectRange(0, $input.val().length);

        e.preventDefault();
    });

    /*
     * Global paginator tweaks.
     * - Shift+1..9: Jump to page N.
     * - Shift+0: Jump to last page.
     */

    if ($(".paginator").length) {
        // Add paginator above results.
        // $('.paginator').clone().insertBefore('#post-sections');

        /* Shift+1..9: Jump to page N. */
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n =>
            $(document).keydown(`shift+${n}`, e => {
                Danbooru.Paginator.goto(n);
                e.preventDefault();
            })
        );

        // Shift+0: Switch to last page if there is one.
        $(document).keydown(`shift+0`, e => {
            // a:not(a[rel]) - exclude the Previous/Next links seen in the paginator on /favorites et al.
            const last_page =
                $('div.paginator li:nth-last-child(2) a:not(a[rel])').first().text();

            if (last_page) {
                Danbooru.Paginator.goto(last_page);
            }

            e.preventDefault();
        });
    }
});
