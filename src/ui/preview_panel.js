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
          <article class="ex-no-image-selected">
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
    PreviewPanel.save();

    if (ModeMenu.getMode() === "view") {
      PreviewPanel.$panel.hide();
    }

    if (PreviewPanel.opened()) {
      Sidebar.close();
    }

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

  static renderPost(post) {
    return `
      <section class="ex-preview-panel-post">
        <div class="ex-preview-panel-post-metadata">
          <div class="ex-preview-panel-post-title">
            <span class="post-info">
              <h1>Score</h1>

              <span class="fav-count">
                ${post.fav_count}

                <a href="#">
                  <i class="far fa-heart" aria-hidden="true"></i>
                </a>
              </span>

              <span class="score">
                ${post.score}

                <a href="#">
                  <i class="far fa-thumbs-up" aria-hidden="true"></i>
                </a>
                <a href="#">
                  <i class="far fa-thumbs-down" aria-hidden="true"></i>
                </a>
              </span>
            </span>

            <span class="post-info uploader-name">
              <h1>User</h1>

              <a href="/users/${post.uploader_id}">${_.escape(post.uploader_name)}</a>

              <time class="created-at ex-short-relative-time" datetime="${post.created_at}" title="${moment(post.created_at).format()}">
                ${moment(post.created_at).locale("en-short").fromNow()}
              </time>
            </span>

            <span class="post-info rating">
              <h1>Rating</h1>
              ${post.rating.toUpperCase()}
            </span>

            <span class="post-info source">
              <h1>Source</h1>
              ${post.source_link}
            </span>

            <span class="post-info dimensions">
              <h1>Size</h1>
              ${post.image_width}x${post.image_height}
            </span>
          </div>

          <div class="ex-preview-panel-post-tags">
            ${Tag.renderTagList(post.tags, "ex-tag-list-inline")}
          </div>
        </div>

        <div class="ex-preview-panel-post-body">
          ${Posts.preview(post, { size: "large", classes: [ "ex-no-tooltip" ] })}
        </div>
      </section>
    `;
  }
}
