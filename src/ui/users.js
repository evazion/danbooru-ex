import $ from "jquery";
import _ from "lodash";

import User from "../user.js";

export default class Users {
  static initialize() {
    this.initializeUserLinks();
  }

  // Add tooltips to usernames. Also add data attributes for custom CSS styling.
  static initializeUserLinks() {
    const $users = this.userLinks();
    const ids = $users.map((i, e) => this.parseUserId($(e)));

    User.search("id", ids).then(users => {
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

  static userLinks() {
    return $('a[href^="/users/"]')
      .filter((i, e) => !$(e).text().match(/My Account|Profile/))
      .filter((i, e) => this.parseUserId($(e)));
  }

  static parseUserId($user) {
    return _.nth($user.attr("href").match(/^\/users\/(\d+)$/), 1);
  }
}
