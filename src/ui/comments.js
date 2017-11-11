/* global Danbooru */

import filesize from "filesize";
import _ from "lodash";

export default class Comments {
  static initialize() {
    if ($("#c-comments").length || $("#c-posts #a-show").length) {
      $(function () {
        Comments.initializePatches();
        Comments.initializeMetadata();
      });
    }

    if ($("#c-comments #a-index").length && window.location.search.match(/group_by=post/)) {
      Comments.initializeTagList();
    }
  }

  static initializePatches() {
    // HACK: "Show all comments" replaces the comment list's HTML then
    // initializes all the reply/edit/vote links. We hook into that
    // initialization here so we can add in our own metadata at the same time.
    Danbooru.Comment.initializeVoteLinks = function ($parent) {
      $parent = $parent || $(document);
      $parent.find(".unvote-comment-link").hide();

      Comments.initializeMetadata($parent);
    };
  }

  /*
   * Add 'comment #1234' permalink.
   * Add comment scores.
   */
  static initializeMetadata($parent) {
    $parent = $parent || $(document);

    $parent.find('.comment').each((i, e) => {
      const $menu = $(e).find('menu');

      const post_id = $(e).data('post-id');
      const comment_id = $(e).data('comment-id');
      const comment_score = $(e).data('score');

      if ($menu.children().length > 0) {
        $menu.append($('<li> | </li>'));
      }

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
  static initializeTagList() {
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
            ${post.fav_count}
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
