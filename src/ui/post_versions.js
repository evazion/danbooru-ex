import _ from "lodash";

import Posts from "./posts.js";
import UI from "../ui.js";

export default class PostVersions {
  static initialize() {
    if ($("#c-post-versions #a-index").length && !UI.query("search[post_id]")) {
      PostVersions.initializeThumbnails();
    }
  }

  // Show thumbnails instead of post IDs.
  static initializeThumbnails() {
    let $post_column = $('tr td:nth-child(1)');
    let post_ids = $.map($post_column, e => $(e).text().match(/(\d+).\d+/)[1] );

    let post_data = [];
    let requests = _.chunk(post_ids, 100).map(function (ids) {
      let search = 'id:' + ids.join(',');

      return $.get(`/posts.json?tags=${search}`).then(data => {
        data.forEach(post => post_data[post.id] = post);
      });
    });

    Promise.all(requests).then(() => {
      $post_column.each((i, e) => {
        let post_id = $(e).text().match(/(\d+).\d+/)[1];
        $(e).html(Posts.preview(post_data[post_id]));
      });
    });
  }
}
