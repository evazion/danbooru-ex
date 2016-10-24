import Artists      from "./ui/artists.js";
import Comments     from "./ui/comments.js";
import ForumPosts   from "./ui/forum_posts.js";;
import ModeMenu     from "./ui/mode_menu.js";
import Pools        from "./ui/pools.js";
import Posts        from "./ui/posts.js";
import PostVersions from "./ui/post_versions.js";
import Users        from "./ui/users.js";
import WikiPages    from "./ui/wiki_pages.js";

import Tag from "./tag.js";

export default class UI {
  static initialize() {
    UI.initialize_patches();
    UI.initialize_post_thumbnail_tooltips();
    UI.initialize_post_link_tooltips();
    UI.initialize_user_links();
    UI.initialize_wiki_links();

    UI.initialize_header();
    UI.initialize_relative_times();
    UI.initialize_hotkeys();
  }

  // Prevent middle-click from adding tag when clicking on related tags (open a new tab instead).
  static initialize_patches() {
    const old_toggle_tag = Danbooru.RelatedTag.toggle_tag;
    Danbooru.RelatedTag.toggle_tag = function (e) {
      if (e.which === 1) {
        return old_toggle_tag(e);
      }
    };
  }

  /*
   * Add sticky header.
   */
  static initialize_header() {
    let $sticky = $(`
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
      e.preventDefault();

      let $input = $("#tags, #search_name, #search_name_matches, #query").first();

      // Add a space to end if  box is non-empty and doesn't already have trailing space.
      $input.val().length && $input.val((i, v) => v.replace(/\s*$/, ' '));
      $input.focus().selectRange(0, $input.val().length);
    });
  }

  // Use relative times everywhere.
  static initialize_relative_times() {
    const ABS_DATE = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
    const abs_dates = $('time').filter((i, e) => $(e).text().match(ABS_DATE));

    abs_dates.each((i, e) => {
      const time_ago = moment($(e).attr('datetime')).fromNow();
      $(e).text(time_ago);
    });
  }

  // Show post previews when hovering over post #1234 links.
  static initialize_post_link_tooltips() {
    $('a[href^="/posts/"]')
      .filter((i, e) => /post #\d+/.test($(e).text()))
      .addClass('ex-thumbnail-tooltip-link');

    UI.install_tooltips();
  }

  // Show post previews when hovering over thumbnails.
  static initialize_post_thumbnail_tooltips() {
    // The thumbnail container is .post-preview on every page but comments and
    // the mod queue. Handle those specially.
    if ($("#c-comments").length) {
      $("#c-comments .post-preview .preview img").addClass('ex-thumbnail-tooltip-link');
    } else if ($("#c-post-moderator-queues").length) {
      $("#c-post-moderator-queues .mod-queue-preview aside img").addClass('ex-thumbnail-tooltip-link');
    } else {
      $(".post-preview img").addClass('ex-thumbnail-tooltip-link');
    }

    UI.install_tooltips();
  }

  static install_tooltips(items) {
    const max_size = 450;

    $(".ex-thumbnail-tooltip-link").tooltip({
      items: "*",
      content: `<div style="width: ${max_size}px; height: ${max_size}px"></div>`,
      show: { delay: 350 },
      position: {
        my: "left+10 top",
        at: "right top",
      },
      open: (e, ui) => {
        try {
          let $e = $(e.toElement);
          let $link = $e;

          if ($e.prop("nodeName") === "IMG") {
            $link = $e.closest("a");
          }

          const id = $link.attr('href').match(/\/posts\/(\d+)/)[1];

          $.getJSON(`/posts/${id}.json`).then(post =>
            $(ui.tooltip).html(Posts.preview(post, post.large_file_url, "ex-thumbnail-tooltip"))
          );
        } catch (e) {
          console.log(e);
        }
      }
    });
  }

  // Add data attributes to usernames so that banned users and approvers can be styled.
  static initialize_user_links() {
    const user_ids =
      _($('a[href^="/users"]'))
      .map(e => $(e).attr('href').replace("/users/", ""))
      .map(Number)
      .sortBy()
      .sortedUniq()
      .join(',');

    // XXX should do lookup in batches.
    $.getJSON(`/users.json?limit=1000&search[id]=${user_ids}`).then(users => {
      for (const user of users) {
        let $user = $(`a[href^="/users/${user.id}"]`);

        // $user.addClass(`user-${user.level_string.toLowerCase()}`);

        _(user).forOwn((value, key) =>
          $user.attr(`data-${_(key).kebabCase()}`, value)
        );
      }
    });
  }

  /*
    * Color code tags linking to wiki pages. Also add a tooltip showing the
    * tag creation date and post count.
    */
  static initialize_wiki_links() {
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
            `${Tag.categories[tag.category]} tag #${tag.id} - ${tag.post_count} posts - created on ${tag_created_at}`;

          $(`a[href="/wiki_pages/show_or_new?title=${tag_name}"]`)
            .addClass(`tag-type-${tag.category}`)
            .attr('title', tag_title);
        });
      });
    });
  }

  /*
   * Global keybindings.
   * - Escape: Close notice popups.
   * - W: Smooth scroll up.
   * - S: Smooth scroll down.
   * - Shift+Q: Focus top search bar.
   */
  static initialize_hotkeys() {
    // Escape: Close notice popups.
    $(document).keydown('esc', e => $('#close-notice-link').click());

    // Escape: Unfocus text entry field.
    $('#tag-script-field').attr('type', 'text');
    $('input[type=text],textarea').keydown('esc', e => $(e.currentTarget).blur());

    UI.initialize_scroll_hotkeys();

    if ($(".paginator").length) {
      UI.initialize_paginator_hotkeys();
    }
  }

  static initialize_scroll_hotkeys() {
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
  }

  /*
   * Shift+1..9: Jump to page N.
   * Shift+0: Jump to last page.
   */
  static initialize_paginator_hotkeys() {
    // Add paginator above results.
    // $('.paginator').clone().insertBefore('#post-sections');

    /* Shift+1..9: Jump to page N. */
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n =>
      $(document).keydown(`shift+${n}`, e => {
        UI.gotoPage(n);
        e.preventDefault();
      })
    );

    // Shift+0: Switch to last page if there is one.
    $(document).keydown(`shift+0`, e => {
      e.preventDefault();

      // a:not(a[rel]) - exclude the Previous/Next links seen in the paginator on /favorites et al.
      const last_page = $('div.paginator li:nth-last-child(2) a:not(a[rel])').first().text();

      if (last_page) {
        UI.gotoPage(last_page);
      }
    });
  }

  static linkTo(name, path = "/", params = {}, ...classes) {
    const query = $.param(params);
    const href = (query === "")
               ? path
               : path + "?" + query;

    return `<a class="${_.escape(classes.join(" "))}" href="${href}">${_.escape(name)}</a>`;
  }

  static query(param) {
    return new URL(window.location).searchParams.get(param);
  }

  static openEditPage(controller) {
    // FIXME: Get the ID from the 'Show' link. This is brittle.
    const $show_link =
      $('#nav > menu:nth-child(2) a')
      .filter((i, e) => $(e).text().match(/^Show$/));

    const id = $show_link.attr('href').match(new RegExp(`/${controller}/(\\d+)$`))[1];

    window.location.href = `/${controller}/${id}/edit`;
  }

  // Go to page N.
  static gotoPage(n) {
    if (location.search.match(/page=(\d+)/)) {
      location.search = location.search.replace(/page=(\d+)/, `page=${n}`);
    } else {
      location.search += `&page=${n}`;
    }
  }
}

UI.Artists = Artists;
UI.Comments = Comments;
UI.ForumPosts = ForumPosts;
UI.ModeMenu = ModeMenu;
UI.Pools = Pools;
UI.Posts = Posts;
UI.PostVersions = PostVersions;
UI.Users = Users;
UI.WikiPages = WikiPages;
