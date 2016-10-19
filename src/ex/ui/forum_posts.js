export default class ForumPosts {
  // On forum posts, change "Permalink" to "Forum #1234". */
  static initialize_permalinks() {
    if ($("#c-forum-topics #a-show").length === 0) {
      return false;
    }

    $(".forum-post menu").each(function (i, e) {
      let $forum_id  = $(e).find("li:nth-child(1)");
      let $quote     = $(e).find("li:nth-child(2)");
      let $permalink = $(e).find("li:last-child");

      $permalink.find("a").text(`Forum #${$forum_id.text().match(/\d+/)}`);
      $forum_id.remove();

      // Add separator only if there's something to separate.
      if ($(e).children().length > 1) {
        $permalink.before($("<li>").text("|"));
      }
    });
  }
}
