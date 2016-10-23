import _ from "lodash";

export default class Posts {
  static initialize() {
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

    Danbooru.Post.update_data = _.wrap(Danbooru.Post.update_data, patched_update_data);
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
  static preview(post) {
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

    // XXX get the tag params from the URL if on /posts.
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
  }
}
