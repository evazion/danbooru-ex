export default class ModeMenu {
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
