import _ from "lodash";
import Tag from "../tag.js";

export default class Posts {
  static initialize() {
    if ($("#c-posts #a-show").length === 0) {
      return;
    }

    Posts.initializeResize();
    Posts.initialize_patches();
    Posts.initializeTagList();
    Posts.initialize_hotkeys();
    Posts.initialize_video();
  }

  // Resize notes/ugoira controls as window is resized.
  static initializeResize() {
    new ResizeSensor($('#image-container'), () => {
      $("#image-resize-to-window-link").click();
    });
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

  static initializeTagList() {
    _.forOwn({
      "Artist": "artist",
      "Copyrights": "copyright",
      "Characters": "character",
      "Tags": "general",
    }, (category, heading) => {
      let $header = $('#tag-list :header').filter((i, e) => $(e).text().match(heading));
      let $tags = $header.next('ul');

      $tags.addClass(`ex-${category}-tag-list`);
      $header.wrap(`<span class="ex-tag-list-header ex-${category}-tag-list-header">`);
      $header.parent().append(`<span class="post-count">${$tags.children().size()}</span>`);
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

  static initialize_video() {
    const $video = $("video#image").get(0);
    if ($video) {
      $video.autoplay = EX.config.autoplayVideos;
      $video.muted = EX.config.muteVideos;
      $video.loop = EX.config.loopVideos;
    }
  }

  // Convert the object returned by $(post).data() to an object with the same
  // properties that the JSON API returns.
  static normalize(data) {
    let post = _.mapKeys(data, (v, k) => _.snakeCase(k));
    post.md5 = post.md_5;

    const flags = post.flags.split(/\s+/);
    post.is_pending = _.indexOf(flags, "pending") !== -1;
    post.is_flagged = _.indexOf(flags, "flagged") !== -1;
    post.is_deleted = _.indexOf(flags, "deleted") !== -1;

    post.has_visible_children = post.has_children;
    post.tag_string = post.tags;
    post.pool_string = post.pools;
    post.status_flags = post.flags;
    post.image_width = post.width;
    post.image_height = post.height;

    return post;
  }

  // Generate the post thumbnail HTML.
  static preview(post, { size="preview", classes=[] } = {}) {
    let preview_class = "post-preview ex-post-preview";
    preview_class += " " + classes.join(" ");
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

    const src = (size === "preview") ? post.preview_file_url
              : (size === "large")   ? post.large_file_url
              : post.file_url;

    // XXX only do this if <video>.
    const autoplay = (size === "large" || EX.config.autoplayVideos) ? "autoplay" : "";
    const loop     = (size === "large" || EX.config.loopVideos)     ? "loop"     : "";
    const muted    = (size === "large" || EX.config.muteVideos)     ? "muted"    : "";

    const media = (post.file_ext.match(/webm|mp4|zip/) && size != "preview")
                ? `<video class="post-media" ${autoplay} ${loop} ${muted} src="${src}" title="${_.escape(post.tag_string)}">`
                : `<img class="post-media" itemprop="thumbnailUrl" src="${src}" title="${_.escape(post.tag_string)}">`;

    // XXX get the tag params from the URL if on /posts.
    const tag_params = "";

    return `
      <article itemscope itemtype="http://schema.org/ImageObject"
               id="post_${post.id}" class="${preview_class}" ${data_attributes}>
        <a href="/posts/${post.id}${tag_params}">${media}</a>
      </article>
    `;
  }

  static renderExcerpt(post) {
    return `
      <section class="ex-post-excerpt">
        <h1 class="ex-post-excerpt-title">Post #${post.id}</h1>
        <div class="ex-post-excerpt-body">
          ${Posts.preview(post, { size: "large", classes: [ "ex-post-excerpt-preview", "ex-no-tooltip" ] })}
          <div class="ex-post-excerpt-metadata">
            ${Tag.renderTagList(post, "ex-tag-list-inline")}
          </div>
        </div>
      </section>
    `;
  }
}
