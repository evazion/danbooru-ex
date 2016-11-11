import $ from "jquery";
import _ from "lodash";

import Posts from "./posts.js";
import Post from "../post.js";
import User from "../user.js";

export default class Users {
  static initialize() {
    this.initializeWordBreaks();

    if ($("#c-users #a-show").length) {
      this.initializeExpandableGalleries();
    }
  }

  // Wordbreak long usernames (e.g. GiantCaveMushroom) by inserting
  // zero-width spaces at lowercase -> non-lowercase transitions.
  static initializeWordBreaks() {
    this.userLinks().text((i, name) =>
      name.replace(/([a-z])(?=[^a-z])/g, c => c + "\u200B")
    );
  }

  // Add tooltips to usernames. Also add data attributes for custom CSS styling.
  static initializeUserLinks() {
    const $users = this.userLinks();
    const ids = $users.map((i, e) => this.parseUserId($(e)));

    User.search(ids).then(users => {
      users = _.keyBy(users, "id");
      $users.each((i, e) => {
        const $user = $(e);
        const id = this.parseUserId($user);
        const user = users[id];

        _(user).forOwn((value, key) =>
          $user.attr(`data-${_(key).kebabCase()}`, value)
        );

        const privileges =
          user.level_string +
          (user.is_banned         ? " Banned"      : "") + 
          (user.is_super_voter    ? " Supervoter"  : "") +
          (user.can_approve_posts ? " Approver"    : "") +
          (user.can_upload_free   ? " Contributor" : "");

        const tooltip =
          `${user.name} (${privileges}) - joined ${moment(user.created_at).fromNow()}`;

        $user.attr("title", tooltip);
      });
    });
  }

  static initializeExpandableGalleries() {
    // Rewrite /favorites link into ordfav: search so it's consistent with other post sections.
    $(".box a[href^='/favorites?user_id=']").attr(
      "href", `/posts?tags=ordfav:${encodeURIComponent(Danbooru.meta("current-user-name"))}`
    );

    $("#c-users #a-show > .box").each((i, e) => {
      const $gallery = $(e).addClass("ex-post-gallery");

      // Store the tag search corresponding to this gallery section in a data
      // attribute for the click handler.
      const [match, tags] = $gallery.find("h2 a").attr("href").match(/\/posts\?tags=(.*)/);
      $gallery.attr("data-tags", decodeURIComponent(tags));

      $gallery.find("div").append(`
        <article class="ex-text-post-preview">
          <a href="#">More »</a>
        </article>
      `);

      $gallery.find(".ex-text-post-preview a").click(event => {
        const $gallery = $(event.target).closest(".ex-post-gallery");

        const limit = 30;
        const page = Math.trunc($gallery.find(".post-preview").children().length / limit) + 1;

        Post.get({ tags: $gallery.data("tags"), page, limit }).then(posts => {
          const html = posts.map(Posts.preview).join("");

          // Hide the original posts to avoid appending duplicate posts.
          $gallery.find("div .post-preview:not(.ex-post-preview)").hide();

          // Append new posts, moving the "More »" link to the end.
          const $more = $gallery.find(".ex-text-post-preview").detach();
          $gallery.find("div").append(html, $more);

          $gallery.find(".ex-post-preview").trigger("ex.post-preview:create");
        });

        return false;
      });
    });
  }

  static userLinks() {
    return $('a[href^="/users/"]')
      .filter((i, e) => !$(e).text().match(/My Account|Profile/))
      .filter((i, e) => this.parseUserId($(e)));
  }

  static parseUserId($user) {
    return _.nth($user.attr("href").match(/^\/users\/(\d+)$/), 1);
  }
}
