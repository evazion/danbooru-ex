/* global Danbooru */

import Resource from "./resource.js";

import _ from "lodash";

export default Resource.User = class User extends Resource {
  static get primaryKey() { return "id"; }

  static render(user) {
    let classes = "user-" + user.level_string.toLowerCase();

    if (user.can_approve_posts) { classes += " user-post-approver"; }
    if (user.can_upload_free)   { classes += " user-post-uploader"; }
    if (user.is_super_voter)    { classes += " user-super-voter"; }
    if (user.is_banned)         { classes += " user-banned"; }
    if (Danbooru.meta("style-usernames") === "true") { classes += " with-style"; }

    return `
      <a class="${classes}" href="/users/${user.id}">${_.escape(user.name)}</a>
    `;
  }
}
