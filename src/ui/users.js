import $ from "jquery";
import _ from "lodash";

import Posts from "./posts.js";
import Post from "../post.js";
import User from "../user.js";

export default class Users {
  static initialize() {
    this.initializeWordBreaks();

    if ($("#c-users #a-show").length) {
      this.initializeUserPage();
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

  static initializeUserPage() {
    $(".box a[href^='/favorites?user_id=']").attr(
      "href", `/posts?tags=ordfav:${Danbooru.meta("current-user-name")}`
    );

    $("#c-users #a-show > .box").each((i, e) => {
      let $box = $(e);

      $box.find("h2").wrap('<span>');
      $box.find("span").append(`
        (<a class="ex-expand-section-link ex-expand-section-closed" href="#">more</a>)
      `);

      let [, tags] = $box.find("h2 a").attr("href").match(/\/posts\?tags=(.*)/);
      tags = decodeURIComponent(tags);

      $box.find(".ex-expand-section-link").click(event => {
        const $expand = $(event.target);
        const $container = $box.find("div");

        $expand.toggleClass("ex-expand-section-closed ex-expand-section-open");

        if ($expand.hasClass("ex-expand-section-open")) {
          if ($container.find("article:hidden").length) {
            $expand.text("close");
            $container.find("article").show();
          } else {
            Post.get({ tags, limit: 20 }).then(posts => {
              $expand.text("close");
              const html = posts.map(Posts.preview).join("");
              $container.html(html);
            });
          }
        } else {
          $expand.text("more");
          $container.find("article").slice(6).hide();
        }

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
