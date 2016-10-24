// ==UserScript==
// @name         Danbooru EX
// @namespace    https://github.com/evazion/danbooru-ex
// @version      609
// @source       https://danbooru.donmai.us/users/52664
// @description  Danbooru UI Enhancements
// @author       evazion
// @match        *://*.donmai.us/*
// @match        *://localhost/*
// @grant        none
// @updateURL    https://github.com/evazion/danbooru-ex/raw/master/dist/danbooru-ex.user.js
// @downloadURL  https://github.com/evazion/danbooru-ex/raw/master/dist/danbooru-ex.user.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.11.2/ui/selectable.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.11.2/ui/tooltip.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.js
// ==/UserScript==

// @updateURL    http://127.0.0.1:8000/danbooru-ex.user.js
// @downloadURL  http://127.0.0.1:8000/danbooru-ex.user.js
// @updateURL    https://github.com/evazion/danbooru-ex/raw/master/danbooru-ex.user.js
// @downloadURL  https://github.com/evazion/danbooru-ex/raw/master/danbooru-ex.user.js

/*
 * What is a userscript? A miserable pile of hacks.
 */

var danbooruEX = (function (_$1,jQuery,moment$1) {
'use strict';

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
  return returnValue;
}
_$1 = 'default' in _$1 ? _$1['default'] : _$1;
jQuery = 'default' in jQuery ? jQuery['default'] : jQuery;
moment$1 = 'default' in moment$1 ? moment$1['default'] : moment$1;

class DText {
  static create_expandable(name, content) {
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
  }
}

class Tag {}

Tag.categories = [
    "General",    // 0
    "Artist",     // 1
    undefined,    // 2 (unused)
    "Copyright",  // 3
    "Character"   // 4
];

class Artists {
  static initialize() {
    if ($("#c-artists #a-show").length) {
      Artists.initialize_hotkeys();
    }

    if ($("#c-artists #a-index").length) {
      Artists.replace_index();
    }
  }

  static initialize_hotkeys() {
    $(document).keydown("e", e => UI.openEditPage('artists'));
  }

  static replace_index() {
    let $table = $("#c-artists #a-index > table:nth-child(2)");

    let artists = _($table.find("> tbody > tr")).map(e => new Object({
      id:   $(e).attr("id").match(/artist-(\d+)/)[1],
      name: $(e).find("> td:nth-child(1) > a:nth-child(1)").text()
    }));

    let requests = [
      EX$1.search("/artists.json", { id: artists.map("id").join(","), order: UI.query("search[order]") }),
      EX$1.search("/tags.json",    { name: artists.map("name").join(","), hide_empty: "no" }),
    ];

    Promise.all(requests).then(([artists, tags]) => {
      artists = artists.map(artist =>
        _.merge(artist, {
          tag: _(tags).find(["name", artist.name])
        })
      );

      const html = Artists.render_artist_table(artists);
      $table.addClass("artist-table").html(html).show();
    });
  }

  static render_artist_table(artists) {
    return `
      <thead>
        <tr>
          <th class="artist-id">ID</th>
          <th class="artist-name">Name</th>
          <th class="artist-post-count">Posts</th>
          <th class="artist-other-names">Other Names</th>
          <th class="artist-group-name">Group</th>
          <th class="artist-status">Status</th>
          <th class="artist-created">Created</th>
          <th class="artist-updated">Updated</th>
        </tr>
      </thead>
      <tbody>
        ${artists.map(Artists.render_row).join("")}
      </tbody
    `;
  }

  static render_row(artist) {
    const other_names =
      (artist.other_names || "")
      .split(/\s+/)
      .sort()
      .map(name =>
        UI.linkTo(name, "/artists", { search: { name: name }}, "artist-other-name")
      )
      .join(", ");

    const group_link = UI.linkTo(
      artist.group_name, "/artists", { search: { name: `group:${artist.group_name}` }}, "artist-group-name"
    );

    return `
      <tr>
        <td class="artist-id">
          ${UI.linkTo(`artist #${artist.id}`, `/artists/${artist.id}`)}
        </td>
        <td class="artist-name category-${artist.tag.category}">
          ${UI.linkTo("?", "/wiki_pages", { title: artist.name }, "wiki-link")}
          ${UI.linkTo(artist.name, `/artists/${artist.id}`, {}, "artist-link")}
        </td>
        <td class="artist-post-count">
          ${UI.linkTo(artist.tag.post_count, "/posts", { tags: artist.name }, "search-tag")}
        </td>
        <td class="artist-other-names">
          ${other_names}
        </td>
        <td class="artist-group-name">
          ${artist.group_name ? group_link : ""}
        </td>
        <td class="artist-status">
          ${artist.is_banned ? "Banned" : ""}
          ${artist.is_active ? ""       : "Deleted"}
        </td>
        <td class="artist-created">
          ${moment$1(artist.created_at).fromNow()}
        </td>
        <td class="artist-updated">
          ${moment$1(artist.updated_at).fromNow()}
        </td>
      </tr>
    `;
  }
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var filesize = createCommonjsModule(function (module, exports) {
"use strict";

/**
 * filesize
 *
 * @copyright 2016 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 3.3.0
 */
(function (global) {
	var b = /^(b|B)$/;
	var symbol = {
		iec: {
			bits: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"],
			bytes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
		},
		jedec: {
			bits: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"],
			bytes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		}
	};

	/**
  * filesize
  *
  * @method filesize
  * @param  {Mixed}   arg        String, Int or Float to transform
  * @param  {Object}  descriptor [Optional] Flags
  * @return {String}             Readable file size String
  */
	function filesize(arg) {
		var descriptor = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var result = [],
		    val = 0,
		    e = void 0,
		    base = void 0,
		    bits = void 0,
		    ceil = void 0,
		    neg = void 0,
		    num = void 0,
		    output = void 0,
		    round = void 0,
		    unix = void 0,
		    spacer = void 0,
		    standard = void 0,
		    symbols = void 0;

		if (isNaN(arg)) {
			throw new Error("Invalid arguments");
		}

		bits = descriptor.bits === true;
		unix = descriptor.unix === true;
		base = descriptor.base || 2;
		round = descriptor.round !== undefined ? descriptor.round : unix ? 1 : 2;
		spacer = descriptor.spacer !== undefined ? descriptor.spacer : unix ? "" : " ";
		symbols = descriptor.symbols || descriptor.suffixes || {};
		standard = base === 2 ? descriptor.standard || "jedec" : "jedec";
		output = descriptor.output || "string";
		e = descriptor.exponent !== undefined ? descriptor.exponent : -1;
		num = Number(arg);
		neg = num < 0;
		ceil = base > 2 ? 1000 : 1024;

		// Flipping a negative number to determine the size
		if (neg) {
			num = -num;
		}

		// Zero is now a special case because bytes divide by 1
		if (num === 0) {
			result[0] = 0;
			result[1] = unix ? "" : !bits ? "B" : "b";
		} else {
			// Determining the exponent
			if (e === -1 || isNaN(e)) {
				e = Math.floor(Math.log(num) / Math.log(ceil));

				if (e < 0) {
					e = 0;
				}
			}

			// Exceeding supported length, time to reduce & multiply
			if (e > 8) {
				e = 8;
			}

			val = base === 2 ? num / Math.pow(2, e * 10) : num / Math.pow(1000, e);

			if (bits) {
				val = val * 8;

				if (val > ceil && e < 8) {
					val = val / ceil;
					e++;
				}
			}

			result[0] = Number(val.toFixed(e > 0 ? round : 0));
			result[1] = base === 10 && e === 1 ? bits ? "kb" : "kB" : symbol[standard][bits ? "bits" : "bytes"][e];

			if (unix) {
				result[1] = standard === "jedec" ? result[1].charAt(0) : e > 0 ? result[1].replace(/B$/, "") : result[1];

				if (b.test(result[1])) {
					result[0] = Math.floor(result[0]);
					result[1] = "";
				}
			}
		}

		// Decorating a 'diff'
		if (neg) {
			result[0] = -result[0];
		}

		// Applying custom symbol
		result[1] = symbols[result[1]] || result[1];

		// Returning Array, Object, or String (default)
		if (output === "array") {
			return result;
		}

		if (output === "exponent") {
			return e;
		}

		if (output === "object") {
			return { value: result[0], suffix: result[1], symbol: result[1] };
		}

		return result.join(spacer);
	}

	// CommonJS, AMD, script tag
	if (typeof exports !== "undefined") {
		module.exports = filesize;
	} else if (typeof define === "function" && define.amd) {
		define(function () {
			return filesize;
		});
	} else {
		global.filesize = filesize;
	}
})(typeof window !== "undefined" ? window : commonjsGlobal);
});

class Comments {
  static initialize() {
    if ($("#c-comments").length === 0 && $("#c-posts #a-show").length === 0) {
      return;
    }

    Comments.initialize_patches();
    Comments.initialize_metadata();
    Comments.initialize_tag_list();
  }

  static initialize_patches() {
    // HACK: "Show all comments" replaces the comment list's HTML then
    // initializes all the reply/edit/vote links. We hook into that
    // initialization here so we can add in our own metadata at the same time.
    Danbooru.Comment.initialize_vote_links = function ($parent) {
      $parent = $parent || $(document);
      $parent.find(".unvote-comment-link").hide();

      Comments.initialize_metadata($parent);
    };
  }

  /*
   * Add 'comment #1234' permalink.
   * Add comment scores.
   */
  static initialize_metadata($parent) {
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
  }

  // Sort tags by type, and put artist tags first.
  static initialize_tag_list() {
    if ($("#c-comments #a-index").length === 0) {
      return;
    }

    const post_ids = $(".comments-for-post").map((i, e) => $(e).data('post-id')).toArray();

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
}

class ForumPosts {
  static initialize() {
    if ($("#c-forum-topics #a-show").length === 0) {
      return false;
    }

    ForumPosts.initialize_permalinks();
  }

  // On forum posts, change "Permalink" to "Forum #1234". */
  static initialize_permalinks() {
    $(".forum-post menu").each((i, e) => {
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
}

class ModeMenu {
  static initialize() {
    /*
     * Use the mode menu everywhere *but* on /posts/show (so as to not
     * interfere with existing keyboard shortcuts on that page).
     */
    if ($("#c-posts #a-show").length) {
      return;
    }

    ModeMenu.initialize_patches();

    Danbooru.PostModeMenu.initialize_selector();
    Danbooru.PostModeMenu.initialize_preview_link();
    Danbooru.PostModeMenu.initialize_edit_form();
    Danbooru.PostModeMenu.initialize_tag_script_field();
    Danbooru.PostModeMenu.initialize_shortcuts();
    Danbooru.PostModeMenu.change();

    $('#sticky-header .mode-box button').click(ModeMenu.apply_mode);

    $(document).bind('keydown', 'ctrl+a',  ModeMenu.select_all);
    $(document).bind('keydown', 'shift+a', ModeMenu.apply_mode);

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
        e.preventDefault();

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
      });
    });
  }

  static initialize_patches() {
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
  }

  // Apply current mode to all selected posts.
  static apply_mode(e) {
    e.preventDefault();

    $(".ui-selected").each((i, e) => {
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
  }

  // Toggle post selection between all or none.
  static select_all(e) {
    e.preventDefault();

    if ($('.ui-selected').length) {
      $('.ui-selected').removeClass('ui-selected');
    } else {
      $('.post-preview').addClass('ui-selected');
    }
  }
}

class Pools {
  static initialize() {
    if ($("#c-pools #a-show").length) {
      $(document).keydown("e", e => EX.UI.openEditPage('pools'));
    }
  }
}

class Posts {
  static initialize() {
    if ($("#c-posts #a-show").length === 0) {
      return;
    }

    Posts.initialize_patches();
    Posts.initialize_artist_tags();
    Posts.initialize_tag_type_counts();
    Posts.initialize_hotkeys();
  }

  // Update Rating in sidebar when it changes.
  static initialize_patches() {
    function patched_update_data(update_data, data) {
      const rating = data.rating === 's' ? "Safe"
                    : data.rating === 'q' ? "Questionable"
                    : data.rating === 'e' ? "Explicit"
                    : "Unknown";

      $("#post-information > ul > li:nth-child(6)").text(`Rating: ${rating}`);
      return update_data(data);
    }

    Danbooru.Post.update_data = _$1.wrap(Danbooru.Post.update_data, patched_update_data);
  }

  // Move artist tags to the top of the tag list.
  static initialize_artist_tags() {
    let $artist_h2 = $('#tag-list h2').filter((i, e) => $(e).text().match(/Artist/));
    let $artist_tags = $artist_h2.next('ul');
    $("#tag-list").prepend($artist_tags).prepend($artist_h2);
  }

  // Add tag counts to the artist/copyright/characters headers.
  static initialize_tag_type_counts() {
    $("#tag-list h1, #tag-list h2").wrap('<span class="tag-list-header">');
    $('#tag-list .tag-list-header').each((i, e) => {
        const tag_count = $(e).next('ul').children().size();
        $(e).append(`<span class="post-count">${tag_count}</span>`);
    });
  }

  /*
   * Alt+S: Rate Safe.
   * Alt+Q: Rate Questionable.
   * Alt+E: Rate Explicit.
   * U / Alt+U: Vote up / vote down.
   */
  static initialize_hotkeys() {
    const post_id = Danbooru.meta("post-id");

    const rate = function (post_id, rating) {
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

  // Generate the post thumbnail HTML.
  static preview(post, src, klass = "") {
    let preview_class = "post-preview";

    src = src || post.preview_file_url;

    preview_class += " " + klass;
    preview_class += post.is_pending           ? " post-status-pending"      : "";
    preview_class += post.is_flagged           ? " post-status-flagged"      : "";
    preview_class += post.is_deleted           ? " post-status-deleted"      : "";
    preview_class += post.parent_id            ? " post-status-has-parent"   : "";
    preview_class += post.has_visible_children ? " post-status-has-children" : "";

    const data_attributes = `
      data-id="${post.id}"
      data-has-sound="${!!post.tag_string.match(/(video_with_sound|flash_with_sound)/)}"
      data-tags="${_$1.escape(post.tag_string)}"
      data-pools="${post.pool_string}"
      data-uploader="${_$1.escape(post.uploader_name)}"
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

    // XXX get the tag params from the URL if on /posts.
    const tag_params = "";

    return `
      <article itemscope itemtype="http://schema.org/ImageObject"
               id="post_${post.id}" class="${preview_class}" ${data_attributes}>
        <a href="/posts/${post.id}${tag_params}">
          <img itemprop="thumbnailUrl"
               src="${src}"
               alt="${_$1.escape(post.tag_string)}">
        </a>
      </article>
    `;
  }
}

class PostVersions {
  static initialize() {
    if ($("#c-post-versions #a-index").length && !UI.query("search[post_id]")) {
      PostVersions.initialize_thumbnails();
    }
  }

  // Show thumbnails instead of post IDs.
  static initialize_thumbnails() {
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
        $(e).html(Posts.preview(post_data[post_id]));
      });
    });
  }
}

class Users {
}

class WikiPages {
  static initialize() {
    if ($("#c-wiki-pages").length === 0) {
      return;
    }

    WikiPages.initialize_collapsible_headings();
    WikiPages.initialize_table_of_contents();
  }

  // Add collapse/expand button to headings.
  static initialize_collapsible_headings() {
    const $headings = $("#wiki-page-body").find('h1,h2,h3,h4,h5,h6');

    if ($headings.length < 3) {
      return;
    }

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
  }

  // Add Table of Contents expandable.
  static initialize_table_of_contents() {
    const $headings = $("#wiki-page-body").find('h1,h2,h3,h4,h5,h6');

    if ($headings.length < 3) {
      return;
    }

    const $toc =
      DText.create_expandable('Table of Contents', '<ul></ul>').prependTo('#wiki-page-body');

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
      const anchor =
        'dtext-' + header.toLowerCase()
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

class UI {
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

__$styleInject(".artist-table {\n  white-space: nowrap;\n}\n\n.artist-table .artist-id {\n  width: 10%;\n}\n\n.artist-table .artist-other-names {\n  width: 100%;\n  white-space: normal;\n}\n\n.ui-tooltip,\n.ui-tooltip .ex-thumbnail-tooltip img {\n  max-width:  450px !important;\n  max-height: 450px !important;\n}\n\n.ui-tooltip .post-preview {\n  width: auto;\n  height: auto;\n}\n\na.with-style[data-can-upload-free=\"false\"][data-can-approve-posts=\"true\"] {\n    text-decoration: underline;\n}\n\na.with-style[data-is-banned=\"true\"] {\n    color: black;\n    text-decoration: underline;\n}\n\n.tag-list-header h1, .tag-list-header h2 {\n    display: inline-block;\n}\n\n.tag-list-header .post-count {\n    margin-left: 0.5em;\n}\n\n/* Ensure colorized tags are still hidden. */\n.spoiler:hover a.tag-type-1 {\n    color: #A00;\n}\n\n.spoiler:hover a.tag-type-3 {\n    color: #A0A;\n}\n\n.spoiler:hover a.tag-type-4 {\n    color: #0A0;\n}\n\n.spoiler:not(:hover) a {\n    color: black !important;\n}\n\n#sticky-header {\n    position: fixed;\n    display: flex;\n    width: 100%;\n    background: white;\n    z-index: 100;\n    border-bottom: 1px solid #EEE;\n}\n\n#sticky-header h1 {\n    display: inline-block;\n    font-size: 2.5em;\n    margin: 0 30px;\n    //padding: 42px 0px 0px 0px;\n}\n\n#sticky-header #search-box {\n    display: inline-block;\n    margin: auto 30px;\n}\n\n#sticky-header #search-box #tags {\n    width: 640px;\n}\n\n#sticky-header #mode-box {\n    margin: auto 30px;\n}\n\n#sticky-header #mode-box form {\n    display: inline-block;\n}\n\n#sticky-header #mode-box form #tag-script-field {\n    margin-top: 0;\n}\n\n\n#notice {\n    top: 4.5em !important;\n}\n\n#top {\n    padding-top: 52px;\n}\n\n#top h1 {\n    display: none;\n}\n\n\n\n#wiki-page-body h1, #wiki-page-body h2, #wiki-page-body h3,\n#wiki-page-body h4, #wiki-page-body h5, #wiki-page-body h6 {\n    //display: flex;\n    //align-items: center;\n    padding-top: 52px;\n    margin-top: -52px;\n}\n\n#wiki-page-body a.ui-icon.collapsible-header {\n    display: inline-block;\n    margin-left: -8px;\n}\n\n\n\n.ui-selected {\n    background: lightblue;\n}\n\n.ui-selectable {\n    -ms-touch-action: none;\n    touch-action: none;\n}\n\n.ui-selectable-helper {\n    position: absolute;\n    z-index: 100;\n    border: 1px dotted black;\n}\n\n.ui-tooltip {\n    padding:   8px;\n    position:  absolute;\n    z-index:   9999;\n    max-width: 300px;\n    -webkit-box-shadow: 0 0 5px #aaa;\n    box-shadow: 0 0 5px #aaa;\n}\n\nbody .ui-tooltip {\n    border-width: 2px;\n}\n\n/*\n.user-member::before, .user-gold::before,\n.user-platinum::before, .user-builder::before,\n.user-janitor::before, .user-moderator::before,\n.user-admin::before {\n    content: '@';\n    color: grey;\n}\n*/\n\n/*\n.paginator {\n    clear: none !important;\n}\n*/\n",undefined);

class EX$1 {
  static search(url, data, success) {
    return $.getJSON(url, { search: data, limit: 1000 }, success);
  }
}

EX$1.DText = DText;
EX$1.Tag = Tag;
EX$1.UI = UI;

EX$1.initialize = function () {
  EX$1.UI.initialize();
  EX$1.UI.Artists.initialize();
  EX$1.UI.Comments.initialize();
  EX$1.UI.ForumPosts.initialize();
  EX$1.UI.ModeMenu.initialize();
  EX$1.UI.Pools.initialize();
  EX$1.UI.Posts.initialize();
  EX$1.UI.PostVersions.initialize();
  EX$1.UI.WikiPages.initialize();
};

window.EX = EX$1;
jQuery(function () {
  "use strict";
  EX$1.initialize();
});

return EX$1;

}(_,jQuery,moment));
