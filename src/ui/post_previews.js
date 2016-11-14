import _ from "lodash";
import $ from "jquery";
import ModeMenu from "./mode_menu.js";
import Posts from "./posts.js";

export default class PostPreviews {
  // Show post previews when hovering over post #1234 links.
  static initializePostLinkPreviews() {
    const posts = $('a[href^="/posts/"]').filter((i, e) => /post #\d+/.test($(e).text()));
    PostPreviews.initialize(posts);
  }

  // Show post previews when hovering over thumbnails.
  static initializeThumbnailPreviews() {
    // The thumbnail container is .post-preview on every page but comments and
    // the mod queue. Handle those specially.
    const posts = $(`
      .post-preview > a > img,
      #c-comments .post-preview > .preview > a > img,
      #c-post-moderator-queues .mod-queue-preview aside img
    `);

    PostPreviews.initialize(posts);

    $(document).on("ex.post-preview:create", event => {
      const $post = $(event.target).find("img");
      PostPreviews.initialize($post);
    });
  }

  static initialize($target) {
    const max_size = 450;

    $target.tooltip({
      items: "*",
      content: `<div style="width: ${max_size}px; height: ${max_size}px"></div>`,
      show: { delay: EX.config.thumbnailPreviewDelay },
      position: {
        my: "left+10 top",
        at: "right top",
      },
      open: (e, ui) => {
        try {
          // XXX should instead disable thumbnails when preview panel is open.
          if (ModeMenu.getMode() === "preview" || ModeMenu.getMode() === "tag-script") {
            $(ui.tooltip).css({ visibility: "hidden" });
            return;
          }

          let $e = $(e.target);
          let $link = $e;

          // XXX hack
          if ($e.prop("nodeName") === "IMG") {
            $link = $e.closest("a");
          }

          const id = $link.attr('href').match(/\/posts\/(\d+)/)[1];

          // XXX avoid lookup on tooltip open.
          $.getJSON(`/posts/${id}.json`).then(post =>
            $(ui.tooltip).html(Posts.preview(post, { size: "large", classes: [ "ex-thumbnail-tooltip" ]}))
          );
        } catch (e) {
          console.log(e);
        }
      }
    });
  }
}
