/* global Danbooru */

import Header       from "./ui/header.js";
import ModeMenu     from "./ui/mode_menu.js";
import Notes        from "./ui/notes.js";
import PostPreviews from "./ui/post_previews.js";
import PreviewPanel from "./ui/preview_panel.js";
import Sidebar      from "./ui/sidebar.js";

import Artists      from "./ui/artists.js";
import Comments     from "./ui/comments.js";
import ForumPosts   from "./ui/forum_posts.js";
import Posts        from "./ui/posts.js";
import PostVersions from "./ui/post_versions.js";
import Users        from "./ui/users.js";
import WikiPages    from "./ui/wiki_pages.js";

import EX from "./ex.js";
import Tag from "./tag.js";

import _ from "lodash";
import moment from "moment";

export default class UI {
  static initialize() {
    UI.initialize_footer();
    UI.initialize_moment();
    UI.initialize_patches();

    EX.config.styleWikiLinks && UI.initialize_wiki_links();
    EX.config.useRelativeTimestamps && UI.initialize_relative_times();
  }

  // Prevent middle-click from adding tag when clicking on related tags (open a new tab instead).
  static initialize_patches() {
    const old_toggle_tag = Danbooru.RelatedTag.toggle_tag;
    Danbooru.RelatedTag.toggle_tag = function (e) {
      if (e.which === 1) {
        return old_toggle_tag(e);
      }
    };
  }

  // Use relative times everywhere.
  static initialize_relative_times() {
    const ABS_DATE = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
    const abs_dates = $('time').filter((i, e) => $(e).text().match(ABS_DATE));

    abs_dates.each((i, e) => {
      const time_ago = moment($(e).attr('datetime')).fromNow();
      $(e).text(time_ago);
    });
  }

  static initialize_footer() {
    $("footer").append(
      `| Danbooru EX <a href="https://github.com/evazion/danbooru-ex">v${GM_info.script.version}</a> – <a href="/users/${$('meta[name="current-user-id"]').attr("content")}/edit#ex-settings">Settings</a>`
    );
  }

  static initialize_moment() {
    moment.locale("en-short", {
      relativeTime : {
          future: "in %s",
          past:   "%s",
          s:  "s",
          m:  "1m",
          mm: "%dm",
          h:  "1h",
          hh: "%dh",
          d:  "1d",
          dd: "%dd",
          M:  "1m",
          MM: "%dm",
          y:  "1y",
          yy: "%dy"
      }
    });

    moment.locale("en");
    moment.defaultFormat = "MMMM Do YYYY, h:mm a";
  }

  // Color code tags linking to wiki pages. Also add a tooltip showing the tag
  // creation date and post count.
  static initialize_wiki_links() {
    function parse_tag_name(wiki_link) {
      return decodeURIComponent($(wiki_link).attr('href').match(/^\/wiki_pages\/show_or_new\?title=(.*)/)[1]);
    }

    const meta_wikis = /^(about:|disclaimer:|help:|howto:|list_of|pool_group:|tag_group:|template:)/i;

    const $wiki_links =
      $(`a[href^="/wiki_pages/show_or_new?title="]`)
      .filter((i, e) => $(e).text() != "?");

    const tags =
      _($wiki_links.toArray())
      .map(parse_tag_name)
      .reject(tag => tag.match(meta_wikis))
      .value();

    // Fetch tag data for each batch of tags, then categorize them and add tooltips.
    Tag.search(tags).then(tags => {
      tags = _.keyBy(tags, "name");
      $wiki_links.each((i, e) => {
        const $wiki_link = $(e);
        const name = parse_tag_name($wiki_link);
        const tag = tags[name];

        if (name.match(meta_wikis)) {
          return;
        } else if (tag === undefined) {
          $wiki_link.addClass('tag-dne');
          return;
        }

        const tag_created_at = moment(tag.created_at).format('MMMM Do YYYY, h:mm:ss a');

        const tag_title =
          `${Tag.Categories[tag.category]} tag #${tag.id} - ${tag.post_count} posts - created on ${tag_created_at}`;

        _(tag).forOwn((value, key) =>
          $wiki_link.attr(`data-tag-${_(key).kebabCase()}`, value)
        );

        $wiki_link.addClass(`tag-type-${tag.category}`).attr('title', tag_title);

        if (tag.post_count === 0) {
          $wiki_link.addClass("tag-post-count-empty");
        } else if (tag.post_count < 100) {
          $wiki_link.addClass("tag-post-count-small");
        } else if (tag.post_count < 1000) {
          $wiki_link.addClass("tag-post-count-medium");
        } else if (tag.post_count < 10000) {
          $wiki_link.addClass("tag-post-count-large");
        } else if (tag.post_count < 100000) {
          $wiki_link.addClass("tag-post-count-huge");
        } else {
          $wiki_link.addClass("tag-post-count-gigantic");
        }
      });
    });
  }

  static linkTo(name, path = "/", params = {}, ...classes) {
    const query = $.param(params);
    const href = (query === "")
               ? path
               : path + "?" + query;

    return `<a class="${_.escape(classes.join(" "))}" href="${href}">${_.escape(name)}</a>`;
  }

  static query(param) {
    return new URL(window.location).searchParams.get(param);
  }

  static openEditPage(controller) {
    // FIXME: Get the ID from the 'Show' link. This is brittle.
    const $show_link =
      $('#nav > menu:nth-child(2) a')
      .filter((i, e) => $(e).text().match(/^Show$/));

    const id = $show_link.attr('href').match(new RegExp(`/${controller}/(\\d+)$`))[1];

    window.location.href = `/${controller}/${id}/edit`;
  }
}

UI.Header = Header;
UI.ModeMenu = ModeMenu;
UI.Notes = Notes;
UI.PostPreviews = PostPreviews;
UI.PreviewPanel = PreviewPanel;
UI.Sidebar = Sidebar;

UI.Artists = Artists;
UI.Comments = Comments;
UI.ForumPosts = ForumPosts;
UI.Posts = Posts;
UI.PostVersions = PostVersions;
UI.Users = Users;
UI.WikiPages = WikiPages;
