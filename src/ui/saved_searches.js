import _ from "lodash";

import PostCount from "../post_count.js";
import Post from "../post.js";

export default class SavedSearches {
  static initialize() {
    if ($("#c-saved-searches #a-index").length === 0) {
      return;
    }

    $("thead tr").replaceWith($(`
      <tr>
        <th id="ss-query" data-sort="string" data-sort-multicolumn="1,2,3">
          Query
        </th>
        <th id="ss-labels" data-sort="string" data-sort-multicolumn="2,1,3">
          Labels
        </th>
        <th id="ss-latest-post" data-sort="int" data-sort-multicolumn="2,3,1" data-sort-default="desc">
          Latest Post
        <th></th>
      </tr>
    `));

    $("tbody tr").each((i, row) => {
      $(`<td class="ss-latest-post"></td>`).insertBefore($(row).find(".links"));
    });

    $("tbody tr").each((i, row) => {
      const $search = $(row).find("td:first-child");
      const tags = $search.text();

      PostCount.count(tags).then(count => {
        $search.append(`<span class="post-count">${count}</span>`);
      });

      Post.index({ tags: tags, limit: 1 }).then(posts => {
        const post = _.first(posts);
        const post_link =
          (post === undefined)
          ? "<em>none</em>"
          : `<td data-sort-value="${post.id}"><a href="/posts/${post.id}">post #${post.id}</a>`;

        $(row).find(".ss-latest-post").replaceWith($(post_link));
      });
    });
  }
}
