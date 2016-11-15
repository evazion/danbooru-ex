import _ from "lodash";
import $ from "jquery";
import ModeMenu from "./mode_menu.js";
import Posts from "./posts.js";
import Post from "../post.js";

export default class PostPreviews {
  // Show post previews when hovering over post #1234 links.
  static initializePostLinkPreviews() {
    // const posts = $('a[href^="/posts/"]').filter((i, e) => /post #\d+/.test($(e).text()));
    // PostPreviews.initialize('a[href^="/posts/"]');
  }

  // Show post previews when hovering over thumbnails.
  static initializeThumbnailPreviews() {
    // The thumbnail container is .post-preview on every page but comments and
    // the mod queue. Handle those specially.
    const posts = `
      .post-preview:not(.ex-no-tooltip) > a > img,
      #c-comments .post-preview > .preview > a > img,
      #c-post-moderator-queues .mod-queue-preview aside img
    `;

    PostPreviews.initialize(posts);
  }

  static initialize(selector) {
    $(document).on('mouseover', selector, event => {
      const delay = EX.config.thumbnailPreviewDelay;
      const [match, postID] = $(event.target).closest("a").attr("href").match(/\/posts\/(\d+)/);

      $(event.target).qtip({
        content: {
          text: (event, api) => {
            Post.get(postID).then(post => {
              api.set("content.text", Posts.renderExcerpt(post));
              api.reposition(event, false);
            });

            return "Loading...";
          }
        },
        overwrite: false,
        style: {
          classes: "qtip-bootstrap",
          tip: {
            corner: false,
          }
        },
        show: {
          delay: delay,
          solo: true,
          event: event.type,
          ready: true
        },
        hide: {
          delay: 100,
          fixed: true,
        },
        position: {
          my: "center left",
          at: "center right",
          viewport: $(window),
          adjust: {
            method: "flipinvert shift",
            resize: false,
            scroll: false,
            x: 10,
          }
        }
      }, event);
    });
  }
}
