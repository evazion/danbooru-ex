import Header       from "./ui/header.js";
import ModeMenu     from "./ui/mode_menu.js";
import Notes        from "./ui/notes.js";
import PostPreviews from "./ui/post_previews.js";
import PreviewPanel from "./ui/preview_panel.js";
import Sidebar      from "./ui/sidebar.js";

import Artists      from "./ui/artists.js";
import Comments     from "./ui/comments.js";
import Posts        from "./ui/posts.js";
import PostVersions from "./ui/post_versions.js";
import SavedSearches from "./ui/saved_searches.js";
import Users        from "./ui/users.js";
import WikiPages    from "./ui/wiki_pages.js";

import EX from "./ex.js";
import Tag from "./tag.js";

import _ from "lodash";
import moment from "moment";

export default class UI {
  static initialize() {
    UI.initializeFooter();
    UI.initializeMoment();

    EX.config.styleWikiLinks && UI.initializeWikiLinks();
    EX.config.useRelativeTimestamps && UI.initializeRelativeTimes();

    const $viewport = $('<div id="ex-viewport"></div>');
    $("body").append($viewport);
  }

  // Use relative times everywhere.
  static initializeRelativeTimes() {
    const ABS_DATE = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
    const absDates = $('time').filter((i, e) => $(e).text().match(ABS_DATE));

    absDates.each((i, e) => {
      const timeAgo = moment($(e).attr('datetime')).fromNow();
      $(e).text(timeAgo);
    });
  }

  static initializeFooter() {
    $("footer").append(
      `| Danbooru EX <a href="https://github.com/evazion/danbooru-ex">v${GM_info.script.version}</a> – <a href="/users/${$('meta[name="current-user-id"]').attr("content")}/edit#ex-settings">Settings</a>`
    );
  }

  static initializeMoment() {
    moment.locale("en-short", {
      relativeTime : {
          future: "in %s",
          past:   "%s ago",
          s:  "1 second",
          ss:  "%d seconds",
          m:  "1 minute",
          mm: "%d minutes",
          h:  "1 hour",
          hh: "%d hours",
          d:  "1 day",
          dd: "%d days",
          M:  "1 month",
          MM: "%d months",
          y:  "1 year",
          yy: "%d years"
      }
    });

    moment.locale("en");
    moment.defaultFormat = "MMMM Do YYYY, h:mm a";
  }

  // Color code tags linking to wiki pages. Also add a tooltip showing the tag
  // creation date and post count.
  static initializeWikiLinks() {
    const parseTagName = wikiLink => decodeURIComponent($(wikiLink).attr('href').match(/\?title=(.*)$/)[1]);
    const metaWikis = /^(about:|disclaimer:|help:|howto:|list_of|pool_group:|tag_group:|template:)/i;
    const $wikiLinks = $(".dtext-wiki-link");

    const tags =
      _($wikiLinks.toArray())
      .map(parseTagName)
      .reject(tag => tag.match(metaWikis))
      .value();

    // Fetch tag data for each batch of tags, then categorize them and add tooltips.
    Tag.search(tags).then(tags => {
      tags = _.keyBy(tags, "name");
      $wikiLinks.each((i, e) => {
        const $wikiLink = $(e);
        const name = parseTagName($wikiLink);
        const tag = tags[name];

        if (name.match(metaWikis)) {
          return;
        } else if (tag === undefined) {
          $wikiLink.addClass('tag-dne');
          return;
        }

        const tagCreatedAt = moment(tag.created_at).format('MMMM Do YYYY, h:mm:ss a');
        const tagTitle = `${Tag.Categories[tag.category]} tag #${tag.id} - ${tag.post_count} posts - created on ${tagCreatedAt}`;
        $wikiLink.addClass(`tag-type-${tag.category}`).attr('title', tagTitle);

        if (tag.post_count === 0) {
          $wikiLink.addClass("tag-post-count-empty");
        } else if (tag.post_count < 1000) {
          $wikiLink.addClass("tag-post-count-small");
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
}

UI.Header = Header;
UI.ModeMenu = ModeMenu;
UI.Notes = Notes;
UI.PostPreviews = PostPreviews;
UI.PreviewPanel = PreviewPanel;
UI.Sidebar = Sidebar;

UI.Artists = Artists;
UI.Comments = Comments;
UI.Posts = Posts;
UI.PostVersions = PostVersions;
UI.SavedSearches = SavedSearches;
UI.Users = Users;
UI.WikiPages = WikiPages;
