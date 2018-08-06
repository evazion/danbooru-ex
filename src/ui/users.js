import _ from "lodash";
import moment from "moment";

import Posts from "./posts.js";
import Post from "../post.js";
import User from "../user.js";

export default class Users {
  static get QTIP_SETTINGS() {
    return {
      overwrite: false,
      style: {
        classes: "qtip-bootstrap",
        tip: { corner: false },
      },
      show: {
        solo: true,
        ready: true
      },
      hide: {
        delay: 100,
        fixed: true,
      },
      position: {
        my: "top left",
        at: "top right",
        effect: false,
        adjust: {
          method: "flipinvert shift",
          resize: false,
          scroll: false,
          x: 10,
        }
      }
    };
  }

  static initialize() {
    this.initializeWordBreaks();

    if ($("#c-users #a-show").length) {
      this.initializeCollapsibleHeaders();
      this.initializeExpandableGalleries();
    }
  }

  // Wordbreak long usernames (e.g. GiantCaveMushroom) by inserting
  // wordbreaks at lowercase -> non-lowercase transitions.
  static initializeWordBreaks() {
    this.userLinks().html((i, name) =>
      name.replace(/([a-z])(?=[^a-z])/g, c => c + "<wbr>")
    );
  }

  // Add tooltips to usernames. Also add data attributes for custom CSS styling.
  static initializeUserTooltips() {
    // XXX triggers on Profile / Settings links on /static/site_map
    $(document).on("mouseover", '#page a[href^="/users/"]', e => {
        const $user = $(e.target);
        const userId = Users.parseUserId($user);

        if (userId === null) {
            return;
        }

        const qtipParams = _.merge(Users.QTIP_SETTINGS, {
          show: { event: e.type },
          position: { viewport: $("#ex-viewport") },
          content: {
            text: (event, api) => {
              User.get(userId).then(user => {
                api.set("content.text", Users.renderExcerpt(user));
                api.reposition(event, false);
              });

              return "Loading...";
            },
          }
        });

        $user.qtip(qtipParams);
    });
  }

  static initializeCollapsibleHeaders () {
    $("#c-users #a-show > .box").each((i, e) => {
      const $gallery = $(e);

      // Make gallery headers collapsible.
      const $toggleCollapse = $(`<a class="ui-icon ui-icon-triangle-1-s collapsible-header"></a>`);
      $gallery.find("h2").prepend($toggleCollapse);

      $toggleCollapse.click(event => {
        $(event.target).closest("h2").next("div").slideToggle();
        $(event.target).toggleClass('ui-icon-triangle-1-e ui-icon-triangle-1-s');
        return false;
      });
    });
  }

  static initializeExpandableGalleries() {
    const user = $("#a-show > h1 > a").text().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(" ", "_");

    // Rewrite /favorites link into ordfav: search so it's consistent with other post sections.
    $(".box a[href^='/favorites?user_id=']").attr(
      "href", `/posts?tags=ordfav:${encodeURIComponent(user)}`
    );

    $("#c-users #a-show > .box").each((i, e) => {
      const $gallery = $(e).addClass("ex-post-gallery");

      // Store the tag search corresponding to this gallery section in a data
      // attribute for the click handler.
      const [, tags] = $gallery.find('h2 a[href^="/posts"]').attr("href").match(/\/posts\?tags=(.*)/);
      $gallery.attr("data-tags", decodeURIComponent(tags));

      $gallery.find("> div").append(`
        <article class="ex-text-thumbnail">
          <a href="#">More »</a>
        </article>
      `);

      $gallery.find(".ex-text-thumbnail a").click(event => {
        const $gallery = $(event.target).closest(".ex-post-gallery");

        const limit = 30;
        const page = Math.trunc($gallery.find(".post-preview").children().length / limit) + 1;

        Post.index({ tags: $gallery.data("tags"), page, limit }).then(posts => {
          const html = posts.map(Posts.preview).join("");

          // Hide the original posts to avoid appending duplicate posts.
          $gallery.find("> div .post-preview:not(.ex-post-preview)").hide();

          // Append new posts, moving the "More »" link to the end.
          const $more = $gallery.find(".ex-text-thumbnail").detach();
          $gallery.find("> div").append(html, $more);

          $gallery.find(".ex-post-preview").trigger("ex.post-preview:create");
        });

        return false;
      });
    });
  }

  static renderExcerpt(user) {
    return `
      <section class="ex-excerpt ex-user-excerpt">
        <div class="ex-excerpt-title ex-user-excerpt-title">
          <span class="user-info">${User.render(user)}</span>
        </div>
        <div class="ex-excerpt-body ex-user-excerpt-body">
          <dl class="info">
            <dt>Joined</dt>
            <dd>${moment(user.created_at).fromNow()}</dd>
          </dl>
          <dl class="info">
            <dt>Uploads</dt>
            <dd>${user.post_upload_count}</dd>
          </dl>
          <dl class="info">
            <dt>Edits</dt>
            <dd>${user.post_update_count}</dd>
          </dl>
          <dl class="info">
            <dt>Notes</dt>
            <dd>${user.note_update_count}</dd>
          </dl>
          <dl class="info">
            <dt>Comments</dt>
            <dd>${user.comment_count}</dd>
          </dl>
          <dl class="info">
            <dt>Forum Posts</dt>
            <dd>${user.forum_post_count}</dd>
          </dl>
        </div>
      </section>
    `;
  }

  static userLinks() {
    return $('#page a[href^="/users/"]').filter((i, e) => this.parseUserId($(e)));
  }

  static parseUserId($user) {
    return _.nth($user.attr("href").match(/^\/users\/(\d+)$/), 1);
  }
}
