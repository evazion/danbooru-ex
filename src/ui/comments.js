export default class Comments {
  static initialize() {
    if ($("#c-comments").length || $("#c-posts #a-show").length) {
      $(function () {
        Comments.initializePatches();
        Comments.initializeMetadata();
      });
    }
  }

  static initializePatches() {
    // HACK: "Show all comments" replaces the comment list's HTML then
    // initializes all the reply/edit/vote links. We hook into that
    // initialization here so we can add in our own metadata at the same time.
    Danbooru.Comment.initializeVoteLinks = function ($parent) {
      $parent = $parent || $(document);
      $parent.find(".unvote-comment-link").hide();

      Comments.initializeMetadata($parent);
    };
  }

  /*
   * Add 'comment #1234' permalink.
   * Add comment scores.
   */
  static initializeMetadata($parent) {
    $parent = $parent || $(document);

    $parent.find('.comment').each((i, e) => {
      const $menu = $(e).find('menu');

      const post_id = $(e).data('post-id');
      const comment_id = $(e).data('comment-id');
      const comment_score = $(e).data('score');

      if ($menu.children().length > 0) {
        $menu.append($('<li> | </li>'));
      }

      $menu.append($(`
        <li>
          <a href="/posts/${post_id}#comment-${comment_id}">Comment #${comment_id}</a>
        </li>
      `));

      $menu.append($(`
        <span class="info">
          <strong>Score</strong>
          <span>${comment_score}</span>
        </span>
      `));
    });
  }
}
