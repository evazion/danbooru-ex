import EX from "../ex.js";
import ModeMenu from "./mode_menu.js";
import Sidebar from "./sidebar.js";
import Post from "../post.js";
import Posts from "./posts.js";
import Tag from "../tag.js";

import _ from "lodash";
import moment from "moment";

export default class PreviewPanel {
  static initialize() {
    // This is the main content panel that comes before the preview panel.
    let $content = $(`
      #c-posts #content,
      #c-post-appeals #a-index,
      #c-post-flags #a-index,
      #c-post-versions #a-index,
      #c-explore-posts > div,
      #c-notes #a-index,
      #c-pools #a-gallery,
      #c-pools #a-show,
      #c-comments #a-index,
      #c-moderator-post-queues #a-show,
      #c-users #a-show,
      #c-wiki-pages > div > #content,
      #c-wiki-page-versions > div > #content
    `);

    if ($content.length === 0) {
      return;
    }

    $content.parent().addClass("ex-panel-container");
    $content.addClass("ex-content-panel ex-panel");
    $content.after(`
      <div id="ex-preview-panel-resizer" class="ex-vertical-resizer"></div>
      <section id="ex-preview-panel" class="ex-panel">
        <div id="ex-preview-panel-container">
          <article>
            No image selected. Click a thumbnail to open image preview.
          </article>
        </div>
      </section>
    `);

    // XXX: sometimes a huge offset is calculated. don't know why.
    // PreviewPanel.origTop = $("#ex-preview-panel > div").offset().top;
    PreviewPanel.origTop = 127;

    const width = _.defaultTo(EX.config.previewPanelState[EX.config.pageKey()], EX.config.defaultPreviewPanelWidth);
    PreviewPanel.setWidth(width);
    PreviewPanel.setHeight();
    PreviewPanel.save();

    if (ModeMenu.getMode() === "view") {
      PreviewPanel.$panel.hide();
    }

    if (PreviewPanel.opened()) {
      Sidebar.close();
    }

    $(document).scroll(_.throttle(PreviewPanel.setHeight, 16));
    $('.ex-mode-menu select[name="mode"]').change(PreviewPanel.switchMode);
    $("#ex-preview-panel-resizer").draggable({
      axis: "x",
      helper: "clone",
      drag: _.throttle(PreviewPanel.resize, 16),
      stop: _.debounce(PreviewPanel.save, 100),
    });
  }

  static async update($post) {
    const postId = $post.data("id");
    const post = await Post.get(postId);

    const html = PreviewPanel.renderPost(post);

    $("#ex-preview-panel > div").children().first().replaceWith(html);
  }

  static get $panel() {
    return $("#ex-preview-panel");
  }

  static resize(e, ui) {
    // XXX magic number
    PreviewPanel.setWidth($("body").innerWidth() - ui.position.left - 28);
  }

  static save() {
    let state = EX.config.previewPanelState;
    state[EX.config.pageKey()] = PreviewPanel.$panel.width();
    EX.config.previewPanelState = state;
  }

  static opened() {
    return PreviewPanel.$panel.is(":visible") && PreviewPanel.$panel.width() > 0;
  }

  static open() {
    if (PreviewPanel.$panel.width() === 0) {
      PreviewPanel.setWidth(EX.config.defaultPreviewPanelWidth);
    }

    PreviewPanel.$panel.show({ effect: "slide", direction: "left" }).promise().then(PreviewPanel.save);
    Sidebar.close();
  }

  static close() {
    PreviewPanel.$panel.hide({ effect: "slide", direction: "right" }).promise().then(PreviewPanel.save);
    Sidebar.open();
  }

  static switchMode() {
    if (ModeMenu.getMode() === "view") {
      PreviewPanel.close();
    } else {
      PreviewPanel.open();
    }
  }

  static setWidth(width) {
    PreviewPanel.$panel.width(width);
    PreviewPanel.$panel.css({ flex: `0 0 ${width}px` });
    $("#ex-preview-panel > div").width(width);
  }

  static setHeight() {
    const headerHeight = $("#ex-header").outerHeight(true);
    const footerHeight = $("footer").outerHeight(true);

    let height;
    if (window.scrollY + headerHeight >= PreviewPanel.origTop) {
      $("#ex-preview-panel > div").addClass("ex-fixed").css({ top: headerHeight });
      height = `calc(100vh - ${headerHeight}px)`;
    } else {
      $("#ex-preview-panel > div").removeClass("ex-fixed");
      height = `calc(100vh - ${PreviewPanel.origTop - window.scrollY}px)`;
    }

    const diff = window.scrollY + window.innerHeight + footerHeight - $("body").height();
    if (diff >= 0) {
      height = `calc(100vh - ${headerHeight}px - ${diff}px)`;
    }

    $("#ex-preview-panel > div").css({ height });
    $("#ex-preview-panel > div > article.post-preview .post-media").css({ "max-height": height });
  }

  static renderPost(post) {
    return `
      <section class="ex-excerpt ex-post-excerpt">
        <div class="ex-excerpt-title ex-post-excerpt-title">
          <span class="post-info uploader-name">
            <a href="/users/${post.uploader_id}">${_.escape(post.uploader_name)}</a>
          </span>

          <time class="post-info created-at ex-short-relative-time"
                datetime="${post.created_at}"
                title="${moment(post.created_at).format()}">
            ${moment(post.created_at).locale("en-short").fromNow()} ago
          </time>

          <span class="post-info fav-count">
            <a href="#">${post.fav_count}</a>
            <a href="#">
              <i class="far fa-star" aria-hidden="true"></i>
            </a>
          </span>

          <span class="post-info score">
            ${post.score}
            <a href="#">
              <i class="far fa-thumbs-up" aria-hidden="true"></i>
            </a>
            <a href="#">
              <i class="far fa-thumbs-down" aria-hidden="true"></i>
            </a>
          </span>

          <span class="post-info source">
            <a href="${_.escape(post.source)}">${post.source_domain}</a>
          </span>

          <span class="post-info rating">
            ${post.pretty_rating}
          </span>

          <span class="post-info dimensions">
            ${post.image_width}x${post.image_height}
          </span>
        </div>

        <div class="ex-excerpt-body ex-post-excerpt-body">
          ${Posts.preview(post, { size: "large", classes: [ "ex-no-tooltip" ] })}
          <div class="ex-post-excerpt-metadata">
            ${Tag.renderTagList(post, "ex-tag-list-inline")}
          </div>
        </div>
      </section>
    `;
  }
}
