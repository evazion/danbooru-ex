// ==UserScript==
// @name         Danbooru EX
// @version      2018.08.21@19.56.54
// @namespace    https://github.com/evazion/danbooru-ex
// @source       https://github.com/evazion/danbooru-ex
// @description  Danbooru UI Enhancements
// @author       evazion
// @match        *://*.donmai.us/*
// @grant        none
// @run-at       document-body
// @downloadURL  https://github.com/evazion/danbooru-ex/raw/stable/dist/danbooru-ex.user.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.12.1/ui/widgets/selectable.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.12.1/ui/widgets/tooltip.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.1/moment.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js
// @require      https://unpkg.com/filesize@3.5.11
// @require      https://unpkg.com/css-element-queries@0.3.2/src/ResizeSensor.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/qtip2/3.0.3/jquery.qtip.js
// @require      https://unpkg.com/mousetrap@1.6.0/mousetrap.js
// @require      https://unpkg.com/mousetrap@1.6.0/plugins/record/mousetrap-record.js
// @require      https://unpkg.com/mousetrap@1.6.0/plugins/global-bind/mousetrap-global-bind.js
// ==/UserScript==

/*
 * What is a userscript? A miserable pile of hacks.
 */

console.log("Danbooru EX:", GM_info.script.version);
// console.time("loaded");
// console.time("preinit");
// console.time("initialized");

var danbooruEX = (function (_,Mousetrap,moment,ResizeSensor) {
'use strict';

function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);

  return css;
}

_ = _ && _.hasOwnProperty('default') ? _['default'] : _;
Mousetrap = Mousetrap && Mousetrap.hasOwnProperty('default') ? Mousetrap['default'] : Mousetrap;
moment = moment && moment.hasOwnProperty('default') ? moment['default'] : moment;
ResizeSensor = ResizeSensor && ResizeSensor.hasOwnProperty('default') ? ResizeSensor['default'] : ResizeSensor;

class Setting {
  constructor({ value, help, configurable, storage } = {}) {
    this.value = value;
    this.help = help;
    this.configurable = configurable;
    this.storage = storage;
  }

  static Session({ value } = {}) {
    return new Setting({ value, help: "none", configurable: false, storage: window.sessionStorage });
  }

  static Shared({ value = true, help, configurable = true } = {}) {
    return new Setting({ value, help, configurable, storage: window.localStorage });
  }
}

class Config {
  static get Items() {
    return {
      schemaVersion: Setting.Shared({
        configurable: false,
        value: 2
      }),

      enableHeader: Setting.Shared({
        help: "Enable header bar containing search box and mode menu.",
      }),
      enableModeMenu: Setting.Shared({
        help: "Enable mode menu in header bar, disable mode menu in the sidebar. Required for preview panel.",
      }),
      enablePreviewPanel: Setting.Shared({
        help: "Enable the post preview panel. Requires header bar and mode menu to be enabled.",
      }),
      defaultPreviewMode: Setting.Shared({
        help: "Open new tabs in preview mode",
        value: false,
      }),
      enableHotkeys: Setting.Shared({
        help: "Enable additional keyboard shortcuts.",
      }),
      enableLargeThumbnails: Setting.Shared({
        configurable: false,
        help: "Enable extra large thumbnails (experimental; bandwidth intensive).",
        value: false,
      }),
      largeThumbnailSize: Setting.Shared({
        configurable: false,
        help: "The size (in pixels) of large thumbnails.",
        value: 229,
      }),
      showThumbnailPreviews: Setting.Shared({
        help: "Show post preview tooltips when hovering over thumbnails.",
      }),
      showPostLinkPreviews: Setting.Shared({
        help: "Show post preview tooltips when hovering over post #1234 links.",
      }),
      enableNotesLivePreview: Setting.Shared({
        help: "Automatically update note preview as you edit.",
      }),
      usernameTooltips: Setting.Shared({
        help: "Enable tooltips on usernames",
        value: false,
      }),
      styleWikiLinks: Setting.Shared({
        help: "Colorize tags in the wiki and forum, underline links to empty tags, and add tooltips to tags.",
      }),
      useRelativeTimestamps: Setting.Shared({
        help: 'Replace fixed times ("2016-08-10 23:25") with relative times ("3 months ago").',
      }),
      resizeableSidebars: Setting.Shared({
        help: "Make the tag sidebar resizeable (drag edge to resize).",
      }),
      autoplayVideos: Setting.Shared({
        help: "Enable autoplay for webm and mp4 posts (normally enabled by Danbooru).",
      }),
      loopVideos: Setting.Shared({
        help: "Enable looping for video_with_sound posts (normally disabled by Danbooru).",
      }),
      muteVideos: Setting.Shared({
        help: "Mute video_with_sound posts by default.",
        value: false,
      }),

      artistsRedesign: Setting.Shared({
        help: "Enable the redesigned /artists index.",
      }),
      commentsRedesign: Setting.Shared({
        help: "Enable comment scores and extra info on posts in /comments",
      }),
      postsRedesign: Setting.Shared({
        help: 'Move artist tags to the top of the tag list, put tag counts next to tag list headers, and add hotkeys for rating / voting on posts.',
      }),
      postVersionsRedesign: Setting.Shared({
        help: "Add thumbnails on the /post_versions page",
      }),
      wikiRedesign: Setting.Shared({
        help: "Make header sections in wiki entries collapsible and add table of contents to long wiki pages",
      }),
      usersRedesign: Setting.Shared({
        help: "Add expandable saved searches to user account pages",
      }),

      thumbnailPreviewDelay: Setting.Shared({
        configurable: false,
        help: "The delay in milliseconds when hovering over a thumbnail before the preview appears.",
        value: 650,
      }),

      tagScripts: Setting.Shared({
        configurable: false,
        value: _.fill(Array(10), "")
      }),

      defaultSidebarWidth: Setting.Session({
        value: 210
      }),
      defaultPreviewPanelWidth: Setting.Session({
        value: 785
      }),
      sidebarState: Setting.Session({
        value: {}
      }),
      previewPanelState: Setting.Session({
        value: {}
      }),
      modeMenuState: Setting.Session({
        value: {}
      }),
      tagScriptNumber: Setting.Session({
        value: 1
      }),
      headerFixed: Setting.Shared({
        value: true
      }),
    };
  }

  constructor() {
    this.migrate();

    if ($("#c-users #a-edit").length) {
      this.initializeForm();
    }
  }

  migrate() {
    if (Config.Items.schemaVersion.storage["EX.config.schemaVersion"] === undefined) {
      this.reset();
    }

    this.schemaVersion = Config.Items.schemaVersion.value;
  }

  get(key) {
    const item = Config.Items[key];
    const value = JSON.parse(_.defaultTo(
      item.storage["EX.config." + key],
      JSON.stringify(item.value)
    ));

    EX.debug(`[CFG] READ EX.config.${key}:`, value);
    return value;
  }

  set(key, value) {
    const item = Config.Items[key];
    item.storage["EX.config." + key] = JSON.stringify(value);
    EX.debug(`[CFG] SAVE EX.config.${key} =`, value);
    return this;
  }

  get all() {
    return _.mapValues(Config.Items, (v, k) => this.get(k));
  }

  reset() {
    _(Config.Items).each((item, key) => {
      EX.debug(`[CFG] DELETE EX.config.${key}`);
      delete item.storage["EX.config." + key];
    });

    return this;
  }

  pageKey() {
    const controller = $("#page > div:nth-child(2)").attr("id");
    const action = $("#page > div:nth-child(2) > div").attr("id");
    return `${controller} ${action}`;
  }

  initializeForm() {
    const settingsHtml =
      _(Config.Items)
      .map((props, name) => _.merge(props, { name }))
      .filter("configurable")
      .map(setting => this.renderOption(setting))
      .join("");

    $("#advanced-settings-section").after(`
      <fieldset id="ex-settings-section" style="display: none">
        ${settingsHtml}

        <div class="input">
            <label><a href="#" id="factory_reset">Factory Reset</a></label>
            <div class="hint">Clear all Danbooru EX data and reset settings to default state.</div>
        </div>
      </fieldset>
    `);

    $("#edit-options > a:nth-child(2)").after('| <a href="#ex-settings">EX Settings</a>');

    let $tabs = $("#edit-options a:not(#delete-account):not(#change-password)");
    $tabs.off("click").click(e => {
      $tabs.removeClass("active");
      $(e.target).addClass("active");

      $("#a-edit form fieldset").hide();
      $($(e.target).attr("href") + "-section").show();

      e.preventDefault();
    });

    $("#ex-settings-section input").change(e => {
      const name = $(e.target).attr("name");
      const value = e.target.checked;

      this.set(name, value);
      Danbooru.Utility.notice("Setting saved.");
    });

    $("#factory_reset").click(e => {
      confirm('Reset Danbooru EX settings?') && this.reset() && Danbooru.Utility.notice("Danbooru EX reset.");
    });
  }

  renderOption(setting) {
    const name = setting.name;
    const id = "ex_config_" + _.snakeCase(name);
    const value = this.get(name) ? "checked" : "";

    return `
      <div class="input checkbox optional">
        <input class="boolean optional" type="checkbox" ${value} name="${_.camelCase(name)}" id="${id}">
        <label class="boolean optional" for="${id}">${_.startCase(name)}</label>
        <div class="hint">${setting.help}</div>
      </div>
    `;
  }
}

// Define getters/setters for `Config.showHeaderBar` et al.
for (let k of _.keys(Config.Items)) {
  const key = k;
  Object.defineProperty(Config.prototype, key, {
    get: function ()  { return this.get(key) },
    set: function (v) { return this.set(key, v) },
    enumerable: true,
    configurable: true,
  });
}

class DText {
  static createExpandable(name, content) {
    const $expandable = $(`
      <div class="expandable">
        <div class="expandable-header">
          <span>${_.escape(name)}</span>
          <input type="button" value="Show" class="expandable-button">
        </div>
        <div class="expandable-content" style="display: none">
          ${content}
        </div>
      </div>
    `);

    // If our script runs before Danbooru's scripts do, Danbooru will find our
    // expandable and add it's own click handler on top of ours. So delay
    // adding our handler to make sure we overwrite Danbooru's own handler.
    $(function () {
      $expandable.find('.expandable-button').off("click").click(e => {
        $(e.target).closest('.expandable').find('.expandable-content').fadeToggle('fast');
        $(e.target).val((_$$1, val) => val === 'Show' ? 'Hide' : 'Show');
        e.preventDefault();
      });
    });

    return $expandable;
  }
}

class Resource {
  constructor(object) {
    Object.assign(this, object);
  }

  static async request(type, url, params = {}) {
    const query = `${url}?${decodeURIComponent($.param(params))}`;

    // console.time(`${type} ${query}`);
    const request = $.ajax({ url, type: "POST", data: Object.assign({}, params, { _method: type })});
    const response = await request;

    EX.debug(`[NET] ${request.status} ${request.statusText} ${query}`, request);

    if (Array.isArray(response)) {
      return response.map(r => new this(r));
    } else {
      return new this(response);
    }
  }

  static put(id, params = {}) {
    return this.request("PUT", `${this.controller}/${id}.json`, params);
  }

  static get(id, params = {}) {
    return this.request("GET", `${this.controller}/${id}.json`, params);
  }

  static index(params = {}) {
    return this.request("GET", `${this.controller}.json`, params);
  }

  static search(values, otherParams) {
    const key = this.primaryKey;
    const batchedValues = _(values).sortBy().sortedUniq().chunk(1000).value();

    const requests = batchedValues.map(batch => {
      const params = _.merge(this.searchParams, { search: otherParams }, { search: { [key]: batch.join(",") }});
      return this.index(params);
    });

    return Promise.all(requests).then(_.flatten);
  }

  static get searchParams() {
    return { limit: 1000 };
  }

  static get controller() {
    return "/" + _.snakeCase(this.name + "s");
  }
}

var Post = Resource.Post = class Post extends Resource {
  static get primaryKey() { return "post"; }

  get tags() {
    let split_tag_string = (tag_string, category) => {
      return tag_string.split(/\s+/).filter(String).map(name => ({ name, category }));
    };

    return _.concat(
      split_tag_string(this.tag_string_artist, 1),
      split_tag_string(this.tag_string_copyright, 3),
      split_tag_string(this.tag_string_character, 4),
      split_tag_string(this.tag_string_meta, 5),
      split_tag_string(this.tag_string_general, 0),
    );
  }

  static update(postId, tags) {
    return this.put(postId, { "post[old_tag_string]": "", "post[tag_string]": tags });
  }

  get source_domain() {
    try {
      const hostname = new URL(this.source).hostname;
      const domain = hostname.match(/([^.]*)\.([^.]*)$/)[0];
      return domain;
    } catch (_e) {
      return "";
    }
  }

  get source_link() {
    const maxLength = 10;
    const truncatedSource = this.source.replace(new RegExp(`(.{${maxLength}}).*$`), "$1...");

    if (this.source.match(/^https?:\/\//)) {
      return `<a href="${_.escape(this.source)}">${this.source_domain}</a>`;
    } else if (this.source.trim() !== "") {
      return `<i>${_.escape(truncatedSource)}</i>`;
    } else {
      return "<i>none</i>";
    }
  }

  get pretty_rating() {
    switch (this.rating) {
      case "s": return "Safe";
      case "q": return "Questionable";
      case "e": return "Explicit";
    }
  }
};

var Tag = Resource.Tag = class Tag extends Resource {
  static get Categories() {
    return [
      "General",    // 0
      "Artist",     // 1
      undefined,    // 2 (unused)
      "Copyright",  // 3
      "Character",  // 4
      "Meta"        // 5
    ];
  }

  static get searchParams() {
    return _.merge({}, super.searchParams, { search: { hide_empty: "no" }});
  }

  static get primaryKey() { return "name"; }

  static renderTag(tag) {
    const href = `/posts?tags=${encodeURIComponent(tag.name)}`;
    return `<a class="search-tag tag-type-${tag.category}" href="${href}">${_.escape(tag.name)}</a>`;
  }

  static renderTagList(tags, classes) {
    return `
      <section class="ex-tag-list ${classes}">
        <h1>Tags</h1>
        <ul>${tags.map(Tag.renderTagListItem).join("")}</ul>
      </section>
    `;
  }

  static renderTagListItem(tag) {
    return `<li class="category-${tag.category}">${Tag.renderTag(tag)}</li>`;
  }

  static renderSearchTagListItem(tag) {
    return `
      <li class="category-${tag.category}">
        <a class="wiki-link" href="/wiki_pages/show_or_new?title=${encodeURIComponent(tag.name)}">?</a>
        ${Tag.renderTag(tag)}
        <span class="post-count">${tag.post_count}</span>
      </li>
    `;
  }
};

var TagImplication = Resource.TagImplication = class TagImplication extends Resource {
  static get primaryKey() { return "id"; }
};

var User = Resource.User = class User extends Resource {
  static get primaryKey() { return "id"; }

  static render(user) {
    let classes = "user-" + user.level_string.toLowerCase();

    if (user.can_approve_posts) { classes += " user-post-approver"; }
    if (user.can_upload_free)   { classes += " user-post-uploader"; }
    if (user.is_super_voter)    { classes += " user-super-voter"; }
    if (user.is_banned)         { classes += " user-banned"; }
    if (Danbooru.Utility.meta("style-usernames") === "true") { classes += " with-style"; }

    return `
      <a class="${classes}" href="/users/${user.id}">${_.escape(user.name)}</a>
    `;
  }
};

class Posts {
  static initialize() {
    if ($("#c-posts #a-show").length === 0) {
      return;
    }

    $("#image").addClass("ex-fit-width");
    Posts.initializeResize();
    // Posts.initializeImplications();
    Posts.initializeTagList();
    Posts.initializeHotkeys();
    Posts.initializeVideo();
  }

  // Resize notes/ugoira controls as window is resized.
  static initializeResize() {
    new ResizeSensor($('#image-container'), () => {
      $("#image-resize-to-window-link").click();
    });
  }

  static initializeLargeThumbnails() {
    $("article.post-preview").each((i, e) => {
      const $post = $(e);
      const $img = $post.find("img");

      const data = Posts.normalize($post.data());
      const src = `${data.large_file_url}`;
      // const src = `//danbooru.s3.amazonaws.com/${data.md5}.${data.file_ext}`;

      const size = `${EX.config.largeThumbnailSize}px`;
      $post.css({ "width": size, "height": size });
      $img.css({ "width": size, "height": size, "object-fit": "contain" });
      $img.attr("src", src);
    });
  }

  static initializeTagList() {
    _.forOwn({
      "Artist": "artist",
      "Copyrights": "copyright",
      "Characters": "character",
      "Tags": "general",
      "Meta": "meta",
    }, (category, heading) => {
      let $header = $('#tag-list :header').filter((i, e) => $(e).text().match(heading));
      let $tags = $header.next('ul');

      $tags.addClass(`ex-${category}-tag-list`);
      $header.wrap(`<span class="ex-tag-list-header ex-${category}-tag-list-header">`);
      $header.parent().append(`<span class="post-count">${$tags.children().length}</span>`);
    });
  }

  static initializeImplications() {
    let $tags = $('#tag-list');
    let tag_string = $("#image-container").data("tags");

    TagImplication.index({ search: { antecedent_name: tag_string }}).then(implications => {
      let implied_tag_names = _(implications).map('descendant_names').flatMap(str => str.split(" ")).sort().uniq().value();

      Tag.search(implied_tag_names).then(implied_tags => {
        let sortCategory = (category) =>
            category === 1 ? 1  // artist
          : category === 2 ? 2  // copyright
          : category === 4 ? 3  // character
          : category === 0 ? 4  // general
          :                  0; // other

        implied_tags = _.sortBy(implied_tags, [(tag) => sortCategory(tag.category), "name"]);

        $tags.append(`
          <h2>Implied Tags</h2>
          <ul>
            ${implied_tags.map(Tag.renderSearchTagListItem).join("")}
          </ul>
        `);
      });
    });
  }

  /*
   * Alt+S: Rate Safe.
   * Alt+Q: Rate Questionable.
   * Alt+E: Rate Explicit.
   * U / Alt+U: Vote up / vote down.
   */
  static initializeHotkeys() {
    const post_id = Danbooru.Utility.meta("post-id");

    const rate = function (post_id, rating) {
      return function (e) {
        Danbooru.Post.update(post_id, {"post[rating]": rating});
        e.preventDefault();
      };
    };

    $(document).keydown("alt+s", rate(post_id, 's'));
    $(document).keydown("alt+q", rate(post_id, 'q'));
    $(document).keydown("alt+e", rate(post_id, 'e'));

    $(document).keydown("u",     () => Danbooru.Post.vote('up',   post_id));
    $(document).keydown("alt+u", () => Danbooru.Post.vote('down', post_id));
  }

  static initializeVideo() {
    const $video = $("video#image").get(0);
    if ($video) {
      $video.autoplay = EX.config.autoplayVideos;
      $video.muted = EX.config.muteVideos;
      $video.loop = EX.config.loopVideos;
    }
  }

  // Convert the object returned by $(post).data() to an object with the same
  // properties that the JSON API returns.
  static normalize(data) {
    let post = _.mapKeys(data, (v, k) => _.snakeCase(k));
    post.md5 = post.md_5;

    const flags = post.flags.split(/\s+/);
    post.is_pending = _.indexOf(flags, "pending") !== -1;
    post.is_flagged = _.indexOf(flags, "flagged") !== -1;
    post.is_deleted = _.indexOf(flags, "deleted") !== -1;

    post.has_visible_children = post.has_children;
    post.tag_string = post.tags;
    post.pool_string = post.pools;
    post.status_flags = post.flags;
    post.image_width = post.width;
    post.image_height = post.height;

    return post;
  }

  // Generate the post thumbnail HTML.
  static preview(post, { size="preview", classes=[] } = {}) {
    let preview_class = "post-preview ex-post-preview";
    preview_class += " " + classes.join(" ");

    if (size === "preview") {
        preview_class += post.is_pending           ? " post-status-pending"      : "";
        preview_class += post.is_flagged           ? " post-status-flagged"      : "";
        preview_class += post.is_deleted           ? " post-status-deleted"      : "";
        preview_class += post.parent_id            ? " post-status-has-parent"   : "";
        preview_class += post.has_visible_children ? " post-status-has-children" : "";
    }

    const data_attributes = `
      data-id="${post.id}"
      data-has-sound="${!!post.tag_string.match(/(video_with_sound|flash_with_sound)/)}"
      data-tags="${_.escape(post.tag_string)}"
      data-pools="${post.pool_string}"
      data-uploader="${_.escape(post.uploader_name)}"
      data-approver-id="${post.approver_id}"
      data-rating="${post.rating}"
      data-width="${post.image_width}"
      data-height="${post.image_height}"
      data-flags="${post.status_flags}"
      data-parent-id="${post.parent_id}"
      data-has-children="${post.has_children}"
      data-score="${post.score}"
      data-views="${post.view_count}"
      data-fav-count="${post.fav_count}"
      data-pixiv-id="${post.pixiv_id}"
      data-md5="${post.md5}"
      data-file-ext="${post.file_ext}"
      data-file-url="${post.file_url}"
      data-large-file-url="${post.large_file_url}"
      data-preview-file-url="${post.preview_file_url}"
    `;

    let src, scale;
    if (size === "preview") {
      src = post.preview_file_url;

      scale = Math.min(150 / post.image_width, 150 / post.image_height);
      scale = Math.min(1, scale);
    } else if (size === "large") {
      src = post.large_file_url;

      scale = Math.min(1, 850 / post.image_width);
    } else {
      src = post.file_url;

      scale = 1;
    }

    const [width, height] = [Math.round(post.image_width * scale), Math.round(post.image_height * scale)];

    let media;
    if (post.file_ext.match(/webm|mp4|zip/) && size != "preview") {
      const autoplay = (size === "large" || EX.config.autoplayVideos) ? "autoplay" : "";
      const loop     = (size === "large" || EX.config.loopVideos)     ? "loop"     : "";
      const muted    = (size === "large" || EX.config.muteVideos)     ? "muted"    : "";

      media = `
        <video ${autoplay} ${loop} ${muted} width="${width}" height="${height}"
               src="${src}" title="${_.escape(post.tag_string)}">
      `;
    } else {
      media = `
        <img itemprop="thumbnailUrl" width="${width}" height="${height}"
             src="${src}" title="${_.escape(post.tag_string)}">
      `;
    }

    // XXX get the tag params from the URL if on /posts.
    const tag_params = "";

    return `
      <article itemscope itemtype="http://schema.org/ImageObject"
               id="post_${post.id}" class="${preview_class}" ${data_attributes}>
        <a href="/posts/${post.id}${tag_params}">${media}</a>
      </article>
    `;
  }

  static renderExcerpt(post, uploader) {
    return `
      <section class="ex-excerpt ex-post-excerpt">
        <div class="ex-excerpt-title ex-post-excerpt-title">
          <span class="post-info id">
            Post #${post.id}
          </span>

          <span class="separator">·</span>
          <span class="post-info uploader">${User.render(uploader)}</span>

          <span class="separator">·</span>
          <time class="post-info created-at ex-short-relative-time"
                datetime="${post.created_at}"
                title="${moment(post.created_at).format()}">
            ${moment(post.created_at).locale("en-short").fromNow()} ago
          </time>

          <span class="separator">·</span>
          <span class="post-info up-score">
            ${post.up_score}
            <a href="#">
              <i class="fa fa-lg fa-thumbs-o-up" aria-hidden="true"></i>
            </a>
          </span>

          <span class="post-info down-score">
            ${post.down_score}
            <a href="#">
              <i class="fa fa-lg fa-thumbs-o-down" aria-hidden="true"></i>
            </a>
          </span>

          <span class="separator">·</span>
          <span class="post-info fav-count">
            <a href="#">${post.fav_count}</a>
            <a href="#">
              <i class="fa fa-lg fa-star-o" aria-hidden="true"></i>
            </a>
          </span>
        </div>
        <div class="ex-excerpt-body ex-post-excerpt-body">
          ${Posts.preview(post, { size: "large", classes: [ "ex-post-excerpt-preview", "ex-no-tooltip" ] })}
          <div class="ex-post-excerpt-metadata">
            ${Tag.renderTagList(post, "ex-tag-list-inline")}
          </div>
        </div>
      </section>
    `;
  }
}

class PreviewPanel {
  static initialize() {
    // This is the main content panel that comes before the preview panel.
    let $content = $(`
      #c-posts #content,
      #c-post-appeals #a-index,
      #c-post-flags #a-index,
      #c-post-versions #a-index,
      #c-explore-posts > div,
      #c-notes #a-index,
      #c-pools #a-gallery,
      #c-pools #a-show,
      #c-comments #a-index,
      #c-moderator-post-queues #a-show,
      #c-users #a-show,
      #c-wiki-pages > div > #content,
      #c-wiki-page-versions > div > #content
    `);

    if ($content.length === 0) {
      return;
    }

    $content.parent().addClass("ex-panel-container");
    $content.addClass("ex-content-panel ex-panel");
    $content.after(`
      <div id="ex-preview-panel-resizer" class="ex-vertical-resizer"></div>
      <section id="ex-preview-panel" class="ex-panel">
        <div id="ex-preview-panel-container">
          <article class="ex-no-image-selected">
            No image selected. Click a thumbnail to open image preview.
          </article>
        </div>
      </section>
    `);

    // XXX: sometimes a huge offset is calculated. don't know why.
    // PreviewPanel.origTop = $("#ex-preview-panel > div").offset().top;
    PreviewPanel.origTop = 127;

    const width = _.defaultTo(EX.config.previewPanelState[EX.config.pageKey()], EX.config.defaultPreviewPanelWidth);
    PreviewPanel.setWidth(width);
    PreviewPanel.save();

    if (ModeMenu.getMode() === "view") {
      PreviewPanel.$panel.hide();
    }

    $('.ex-mode-menu select[name="mode"]').change(PreviewPanel.switchMode);
    $("#ex-preview-panel-resizer").draggable({
      axis: "x",
      helper: "clone",
      drag: _.throttle(PreviewPanel.resize, 16),
      stop: _.debounce(PreviewPanel.save, 100),
    });
  }

  static async update($post) {
    const postId = $post.data("id");
    const post = await Post.get(postId);
    const html = PreviewPanel.renderPost(post);

    $("#ex-preview-panel > div").children().first().replaceWith(html);
  }

  static get $panel() {
    return $("#ex-preview-panel");
  }

  static resize(e, ui) {
    // XXX magic number
    PreviewPanel.setWidth($("body").innerWidth() - ui.position.left - 28);
  }

  static save() {
    let state = EX.config.previewPanelState;
    state[EX.config.pageKey()] = PreviewPanel.$panel.width();
    EX.config.previewPanelState = state;
  }

  static opened() {
    return PreviewPanel.$panel.is(":visible") && PreviewPanel.$panel.width() > 0;
  }

  static open() {
    if (PreviewPanel.$panel.width() === 0) {
      PreviewPanel.setWidth(EX.config.defaultPreviewPanelWidth);
    }

    PreviewPanel.$panel.show({ effect: "slide", direction: "left" }).promise().then(PreviewPanel.save);
  }

  static close() {
    PreviewPanel.$panel.hide({ effect: "slide", direction: "right" }).promise().then(PreviewPanel.save);
  }

  static switchMode() {
    if (ModeMenu.getMode() === "view") {
      PreviewPanel.close();
    } else {
      PreviewPanel.open();
    }
  }

  static setWidth(width) {
    PreviewPanel.$panel.width(width);
    PreviewPanel.$panel.css({ flex: `0 0 ${width}px` });
    $("#ex-preview-panel > div").width(width);
  }

  static renderPost(post) {
    return `
      <section class="ex-preview-panel-post">
        <div class="ex-preview-panel-post-metadata">
          <div class="ex-preview-panel-post-title">
            <span class="post-info">
              <h1>Score</h1>

              <span class="fav-count">
                ${post.fav_count}

                <a href="#">
                  <i class="far fa-heart" aria-hidden="true"></i>
                </a>
              </span>

              <span class="score">
                ${post.score}

                <a href="#">
                  <i class="far fa-thumbs-up" aria-hidden="true"></i>
                </a>
                <a href="#">
                  <i class="far fa-thumbs-down" aria-hidden="true"></i>
                </a>
              </span>
            </span>

            <span class="post-info uploader-name">
              <h1>User</h1>

              <a href="/users/${post.uploader_id}">${_.escape(post.uploader_name)}</a>

              <time class="created-at ex-short-relative-time" datetime="${post.created_at}" title="${moment(post.created_at).format()}">
                ${moment(post.created_at).locale("en-short").fromNow()}
              </time>
            </span>

            <span class="post-info rating">
              <h1>Rating</h1>
              ${post.rating.toUpperCase()}
            </span>

            <span class="post-info source">
              <h1>Source</h1>
              ${post.source_link}
            </span>

            <span class="post-info dimensions">
              <h1>Size</h1>
              ${post.image_width}x${post.image_height}
            </span>
          </div>

          <div class="ex-preview-panel-post-tags">
            ${Tag.renderTagList(post.tags, "ex-tag-list-inline")}
          </div>
        </div>

        <div class="ex-preview-panel-post-body">
          ${Posts.preview(post, { size: "large", classes: [ "ex-preview-panel-image" ] })}
        </div>
      </section>
    `;
  }
}

class Navigation {
  static gotoPageN(n) {
    if (location.search.match(/page=(\d+)/)) {
      location.search = location.search.replace(/page=(\d+)/, `page=${n}`);
    } else {
      location.search += `&page=${n}`;
    }
  }

  static gotoPage(event) {
    Navigation.gotoPageN(Number(event.key));
  }

  static gotoLastPage(event) {
    // a:not(a[rel]) - exclude the Previous/Next links seen in the paginator on /favorites et al.
    const n = $('div.paginator li:nth-last-child(2) a:not(a[rel])').first().text();

    if (n) {
      Navigation.gotoPageN(n);
    }
  }

  static gotoPageDialog() {
    const $dialog = $(`
      <form>
        <input id="ex-dialog-input" type="text" placeholder="Enter page number">
        <input type="submit" value="Go">
      </form>
    `).dialog({
      title: "Go To Page",
      minHeight: 0,
      minWidth: 0,
      resizable: false,
      modal: true,
    });

    $dialog.submit(() => {
      const page = $dialog.find('input[type="text"]').val();
      Navigation.gotoPageN(page);
      return false;
    });

    return false;
  }

  static goDirection(direction) {
    var href = $(`.paginator a[rel=${direction}]`).attr("href");
    if (href) {
      window.location = href;
    }
  }

  static goTop()    { window.scrollTo(0, 0); }
  static goBottom() { window.scrollTo(0, $(document).height()); }
  static goForward() { window.history.forward(); }
  static goBack()    { window.history.back(); }
  static goNext()   { Navigation.goDirection("next"); }
  static goPrev()   { Navigation.goDirection("prev"); }

  static scroll(direction, duration, distance) {
    return _.throttle(() => {
      const top = $(window).scrollTop() + direction * $(window).height() * distance;
      $('html, body').animate({scrollTop: top}, duration, "linear");
    }, duration);
  }
}

class ModeMenu {
  static initialize() {
    ModeMenu.uninitializeDanbooruModeMenu();
    ModeMenu.overrideDanbooruArrowKeys();
    ModeMenu.initializeModeMenu();
    ModeMenu.initializeTagScriptControls();
    ModeMenu.initializeThumbnails();
  }

  static uninitializeDanbooruModeMenu() {
    Danbooru.PostModeMenu.initialize = _.noop;
    Danbooru.PostModeMenu.show_notice = _.noop;
    $(".post-preview a").unbind("click", Danbooru.PostModeMenu.click);
    $(document).unbind("keydown", "1 2 3 4 5 6 7 8 9 0", Danbooru.PostModeMenu.change_tag_script);
    $("#sidebar #mode-box").hide();
  }

  // Danbooru's default left / right arrow key bindings conflict with our use
  // of the arrow keys in tag script / preview mode. Ignore these bindings
  // during these modes.
  static overrideDanbooruArrowKeys() {
    $('[data-shortcut="d right"]').attr("data-shortcut", "d");
    $('[data-shortcut="a left"]').attr("data-shortcut", "a");
    Danbooru.Shortcuts.initialize_data_shortcuts();

    Danbooru.Utility.keydown("left",  "keydown.danbooru.arrow_prev_page", _e => ModeMenu.getMode() === "view" && Navigation.goPrev());
    Danbooru.Utility.keydown("right", "keydown.danbooru.arrow_next_page", _e => ModeMenu.getMode() === "view" && Navigation.goNext());
  }

  static initializeModeMenu() {
    $('.ex-mode-menu select[name="mode"]').change(ModeMenu.switchMode);
    const defaultMode = (EX.config.defaultPreviewMode && EX.config.pageKey() === "c-posts a-index") ? "preview" : "view";
    const mode = _.defaultTo(EX.config.modeMenuState[EX.config.pageKey()], defaultMode);
    ModeMenu.setMode(mode);
  }

  static initializeTagScriptControls() {
    $('.ex-mode-menu input[name="tag-script"]').on(
      "input", _.debounce(ModeMenu.saveTagScript, 250)
    );

    $('.ex-mode-menu select[name="tag-script-number"]').change(ModeMenu.switchTagScript);
    ModeMenu.setTagScriptNumber(EX.config.tagScriptNumber);

    $('.ex-mode-menu button[name="apply"]').click(ModeMenu.applyTagScript);
    $('.ex-mode-menu button[name="select-all"]').click(ModeMenu.selectAll);
    $('.ex-mode-menu button[name="select-invert"]').click(ModeMenu.invertSelection);
  }

  static initializeThumbnails() {
    const selector = `
      .mod-queue-preview aside a,
      div.post-preview .preview a,
      article.post-preview:not(.ex-preview-panel-image) a
    `;

    $(document).on("click", selector, ModeMenu.onThumbnailClick);

    // Hide cursor when clicking outside of thumbnails.
    $(document).on("click", () => $(".ex-cursor").removeClass("ex-cursor"));
  }

  static switchToTagScript(event) {
    const newN = Number(String.fromCharCode(event.which));
    const oldN = ModeMenu.getTagScriptNumber();

    if (ModeMenu.getMode() === "tag-script" && newN === oldN) {
      $('.ex-mode-menu input[name="tag-script"]').select();
    } else {
      ModeMenu.setMode("tag-script");
      ModeMenu.setTagScriptNumber(newN);
    }

    event.preventDefault();
  }

  static switchMode() {
    const mode = ModeMenu.getMode();

    let state = EX.config.modeMenuState;
    state[EX.config.pageKey()] = mode;
    EX.config.modeMenuState = state;

    $("body").removeClass((i, klass) => (klass.match(/mode-.*/) || []).join(' '));
    $("body").addClass(`mode-${mode}`);

    if (mode === "tag-script") {
      $(".ex-mode-menu .ex-tag-script-controls").show();

      $("#page").selectable({
        filter: "article.post-preview, div.post-preview .preview, .mod-queue-preview aside",
        delay: 200,
      });
    } else {
      $(".ex-mode-menu .ex-tag-script-controls").hide();

      if ($("#page").selectable("instance")) {
        $("#page").selectable("destroy");
      }
    }
  }

  static switchTagScript(event) {
    const n = ModeMenu.getTagScriptNumber();
    EX.config.tagScriptNumber = n;

    const script = EX.config.tagScripts[n];
    $('.ex-mode-menu input[name="tag-script"]').val(script).change();
  }

  static onThumbnailClick(event) {
    // Only apply on left click, not middle click and not ctrl+left click.
    if (event.ctrlKey || event.which !== 1) {
      return true;
    }

    // XXX prevent focused text fields from staying focused when clicking on thumbnails.
    $(":focus").blur();

    if (ModeMenu.getMode() === "view") {
      return true;
    } else {
      Selection.moveCursorTo($(event.target), { selectTarget: true, selectInterval: event.shiftKey });
      return false;
    }
  }

  static applyTagScript(event) {
    const mode = ModeMenu.getMode();

    if (mode === "tag-script") {
      const tags = ModeMenu.getTagScript();
      const postIds = $(".ui-selected").map((i, e) => $(e).closest(".post-preview").data("id"));

      ModeMenu.updatePosts(postIds, tags);
    }
  }

  static updatePosts(postIds, tags, updated = 0, total = postIds.length) {
    const requests = _.map(postIds, postId => {
      const promise = Promise.resolve(Post.update(postId, tags));

      return promise.then(post => {
          updated++;
          Danbooru.Utility.notice(`Updated post #${postId} (${total - updated} remaining)`);
          return { post: post, status: 200 };
        }).catch(resp => {
          return { id: postId, status: resp.status };
        });
    });

    Promise.all(requests).then(posts => {
      const failedPosts = _(posts).difference(_.filter(posts, { status: 200 })).map("id").value();
      const delay = Math.min((failedPosts.length / 4), 3);

      if (failedPosts.length > 0) {
        _.delay(() => ModeMenu.updatePosts(failedPosts, tags, updated, total), delay * 1000);
      }
    });
  }

  static selectAll(event) {
    if ($(".ui-selected").length) {
      $(".ui-selected").removeClass("ui-selected");
    } else {
      $(".ui-selectee").addClass("ui-selected");
    }

    event.preventDefault();
  }

  static invertSelection(event) {
    let $unselected = $(".ui-selectee:not(.ui-selected)");
    let $selected = $(".ui-selectee.ui-selected");

    $unselected.addClass("ui-selected");
    $selected.removeClass("ui-selected");
  }

  static getMode() {
    return $(".ex-mode-menu select").val();
  }

  static setMode(mode) {
    $('.ex-mode-menu select[name="mode"]').val(mode).change();
  }

  static toggleMode(mode) {
    ModeMenu.setMode(ModeMenu.getMode() === mode ? "view" : mode);
  }

  static getTagScript() {
    return $('.ex-mode-menu input[name="tag-script"]').val().trim();
  }

  static saveTagScript() {
    const scripts = EX.config.tagScripts;
    scripts[ModeMenu.getTagScriptNumber()] = ModeMenu.getTagScript();
    EX.config.tagScripts = scripts;
  }

  static getTagScriptNumber() {
    return Number($('.ex-mode-menu select[name="tag-script-number"]').val());
  }

  static setTagScriptNumber(n) {
    $('.ex-mode-menu select[name="tag-script-number"]').val(n).change();
  }
}

class Selection {
  static get post() {
    return "article.post-preview, div.post-preview .preview, .mod-queue-preview aside";
  }

  static get $cursor() {
    return Selection.active()
         ? $(".ex-cursor")
         : $(Selection.post).first().addClass("ex-cursor");
  }

  static set $cursor($newCursor) {
    Selection.$cursor.removeClass("ex-cursor");
    return $newCursor.addClass("ex-cursor");
  }

  static active() {
    return $(".ex-cursor").length > 0;
  }

  static between($from, $to) {
    if ($from.nextAll().is($to)) {
      return $from.nextUntil($to, Selection.post).add($to).addBack();
    } else if ($from.prevAll().is($to)) {
      return $from.prevUntil($to, Selection.post).add($to).addBack();
    } else {
      return $();
    }
  }

  static selectBetween($from, $to) {
    return Selection.between($from, $to).addClass("ui-selected");
  }

  static deselectBetween($from, $to) {
    return Selection.between($from, $to).removeClass("ui-selected");
  }

  static moveCursor(direction, { selectInterval = false } = {}) {
    // XXX if ($(Selection.post).length === 0) {
    if (ModeMenu.getMode() === "view") {
      return true;
    }

    const post = Selection.post;
    const $cursor = Selection.$cursor;
    const firstInColumn = $posts =>
      $posts.filter((i, e) => $(e).position().left === $cursor.position().left).first();

    const $target = direction === "left"  ? $cursor.prev(post)
                  : direction === "right" ? $cursor.next(post)
                  : direction === "up"    ? firstInColumn($cursor.prevAll(post))
                  : direction === "down"  ? firstInColumn($cursor.nextAll(post))
                  : $();

    // XXX cleanup
    if ($target.length) {
      if (selectInterval) { 
        $cursor.closest(Selection.post).toggleClass("ui-selected");
      }

      Selection.moveCursorTo($target, { selectInterval });
    }
  }

  static moveCursorTo($target, { selectTarget = false, selectInterval = false } = {}) {
    const $newCursor = $target.closest(Selection.post);
    const $oldCursor = $(".ex-cursor").length
                     ? $(".ex-cursor")
                     : $newCursor;

    const $newMark = $newCursor;
    const $oldMark = $(".ex-mark").length
                   ? $(".ex-mark")
                   : $(Selection.post).first().addClass("ex-mark");

    Selection.swapCursor($oldCursor, $newCursor);
    
    if (selectTarget) {
        $newCursor.toggleClass("ui-selected");
    }

    if (selectInterval) {
        Selection.deselectBetween($oldMark, $oldCursor);
        Selection.selectBetween($oldMark, $newCursor);
    } else {
        $oldMark.removeClass("ex-mark");
        $newMark.addClass("ex-mark");
    }
  }

  static swapCursor($oldCursor, $newCursor) {
    const $post = $newCursor.closest(".post-preview");

    $oldCursor.removeClass("ex-cursor");
    $newCursor.addClass("ex-cursor");

    Selection.scrollWindowTo($newCursor);
    $newCursor.find("a").focus();

    PreviewPanel.update($post);
  }

  static scrollWindowTo($target) {
    const targetTop = $target.position().top;
    const targetHeight = $target.height();

    if (targetTop + targetHeight > window.scrollY + window.innerHeight) {
      window.scrollTo(0, targetTop + 2*targetHeight - window.innerHeight);
    } else if (targetTop < window.scrollY) {
      window.scrollTo(0, targetTop - targetHeight);
    }
  }

  static toggleSelected() {
    if (!Selection.active()) { return true; }
    Selection.$cursor.toggleClass("ui-selected");
  }

  static open() {
    if (!Selection.active()) { return true; }
    window.location = Selection.$cursor.find("a").attr("href");
  }

  static openInNewTab() {
    if (!Selection.active()) { return true; }
    window.open(Selection.$cursor.find("a").attr("href"));
  }

  static favorite() {
    if (!Selection.active()) { return true; }

    const post = Posts.normalize(Selection.$cursor.closest(".post-preview").data());

    $.post("/favorites.json", { post_id: post.id }).then(() =>
      Danbooru.Utility.notice(`You have favorited post #${post.id}.`)
    );
  }
}

class Header {
  static initialize() {
    Header.initializeHeader();

    if (EX.config.enableModeMenu) {
      Header.initializeModeMenu();

      if (EX.config.enablePreviewPanel) {
        PreviewPanel.initialize();
      }
    }
  }

  static initializeHeader() {
    let $header = $(Header.render()).insertBefore("#top");
    _.defer(() => $header.show());

    // Move news announcements inside of EX header.
    $("#news-updates").insertBefore("#ex-header .ex-header-wrapper");

    // Initalize header search box.
    Header.$tags.val($("#sidebar #tags").val());
    Danbooru.Autocomplete && Danbooru.Autocomplete.initialize_all && Danbooru.Autocomplete.initialize_all();

    Header.$close.click(Header.toggle);
    $(document).scroll(_.throttle(Header.onScroll, 16));
  }

  static initializeModeMenu() {
    $(".ex-mode-menu").show();
    ModeMenu.initialize();
  }

  static onScroll() {
    $("#ex-header").toggleClass("ex-header-scrolled", window.scrollY > 0, { duration: 100 });
    // Shrink header after scrolling down.
    window.scrollY > 0 && $("header h1").addClass("ex-small-header");
  }

  static executeSearchInNewTab() {
    // XXX
    if ($("#ex-header #ex-tags:focus").length) {
      const tags = Header.$tags.val().trim();
      window.open(`/posts?tags=${encodeURIComponent(tags)}`, "_blank").focus();
    }
  }

  static focusSearch() {
    // Add a space to end if box is non-empty and doesn't already have trailing space.
    Header.$tags.val().length && Header.$tags.val((i, v) => v.replace(/\s*$/, ' '));
    Header.$tags.focus();
    return false;
  }

  static toggle() {
    Header.$el.toggleClass("ex-fixed ex-static");
    Header.$close.find("i").toggleClass("fa-times-circle fa-thumbtack");
    EX.config.headerFixed = !EX.config.headerFixed;
  }

  static get $el()    { return $("#ex-header"); }
  static get $close() { return $("#ex-header .ex-header-close"); }
  static get $tags()  { return $("#ex-header #ex-tags"); }

  static render() {
    return `
      <header style="display: none;" id="ex-header" class="${EX.config.headerFixed ? "ex-fixed" : "ex-static"}">
        <div class="ex-header-wrapper">
          <h1><a href="/">Danbooru</a></h1>

          <form class="ex-search-box" action="/posts" accept-charset="UTF-8" method="get">
            <input type="text" data-autocomplete="tag-query" name="tags" id="ex-tags" class="ui-autocomplete-input" autocomplete="off">
            <input type="submit" value="Go">
          </form>

          <section class="ex-mode-menu" style="display: none">
            <label for="mode">Mode</label>
            <select name="mode">
              <option value="view">View</option>
              <option value="preview">Preview</option>
              <option value="tag-script">Tag script</option>
            </select>

            <fieldset class="ex-tag-script-controls" style="display: none">
              <select name="tag-script-number">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
              </select>

              <input id="${EX.config.enableModeMenu ? "tag-script-field" : "" }" name="tag-script" type="text" data-autocomplete="tag-query" placeholder="Enter tag script">
              <button name="apply" type="button">Apply</button>

              <label>Select</label>
              <button name="select-all" type="button">All/None</button>
              <button name="select-invert" type="button">Invert</button>
            </fieldset>
          </section>

          <a class="ex-header-close">
            <i class="fas fa-lg ${EX.config.headerFixed ? "fa-times-circle" : "fa-thumbtack"}" aria-hidden="true"></i>
          </a>
        </div>
      </header>
    `;
  }
}

class Keys {
  constructor() {
    this.actions = {};
    this.bindings = [];
  }

  register(actions = {}) {
    this.actions = _.merge({}, this.actions, actions);
    return this;
  }

  bind(bindings) {
    _(bindings).each(binding => {
      const keys = _(binding).keys().get(0);
      const action = binding[keys];
      const callback = this.actions[action];

      if (action === undefined || callback === undefined) {
        EX.debug(`[KEY] FAIL ${keys} -> ${action}`);
        return this;
      }

      Mousetrap.bind(keys, event => {
        EX.debug(`[KEY] EXEC ${keys} -> ${action} (${callback.name})`);

        return callback(event) === true;
      });

      EX.debug(`[KEY] BIND ${keys} -> ${action} (${callback.name})`);
    });

    this.bindings = _.concat(this.bindings, bindings);
    return this;
  }

  initialize() {
    // Numpad 5
    Mousetrap.addKeycodes({ 12: "clear" });

    this.register({
      "escape": Keys.escape,

      "goto-page": Navigation.gotoPage,
      "goto-last-page": Navigation.gotoLastPage,
      "goto-page-dialog": Navigation.gotoPageDialog,
      
      "go-my-account": () => window.location = `/users/${Danbooru.Utility.meta("current-user-id")}`,
      "go-my-dmails": () => window.location = "/dmails",
      "go-my-favorites": () => window.location = `/posts?tags=ordfav:${encodeURIComponent(Danbooru.Utility.meta("current-user-name"))}`,
      "go-my-saved-searches": () => window.location = `/saved_searches`,
      "go-my-settings": () => window.location = `/users/${Danbooru.Utility.meta("current-user-id")}/edit`,

      "go-artists-index": () => window.location = "/artists",
      "go-bur-new": () => window.location = "/bulk_update_requests/new",
      "go-comments-index": () => window.location = "/comments",
      "go-forum-index": () => window.location = "/forum_topics",
      "go-pools-index": () => window.location = "/pools",
      "go-post-index": () => window.location = "/posts",
      "go-wiki-index": () => window.location = "/wiki_pages",

      "go-top": Navigation.goTop,
      "go-bottom": Navigation.goBottom,
      "go-forward": Navigation.goForward,
      "go-back": Navigation.goBack,

      "header-toggle": Header.toggle,
      "header-focus-search": Header.focusSearch,
      "header-execute-search-in-new-tab": Header.executeSearchInNewTab,

      "select-all": ModeMenu.selectAll,
      "invert-selection": ModeMenu.invertSelection,
      "apply-tag-script": ModeMenu.applyTagScript,
      "switch-to-tag-script": ModeMenu.switchToTagScript,
      "set-preview-mode": () => ModeMenu.setMode("preview"),

      "move-cursor-up": e => Selection.moveCursor("up", { selectInterval: e.shiftKey }),
      "move-cursor-right": e => Selection.moveCursor("right", { selectInterval: e.shiftKey }),
      "move-cursor-down": e => Selection.moveCursor("down", { selectInterval: e.shiftKey }),
      "move-cursor-left": e => Selection.moveCursor("left", { selectInterval: e.shiftKey }),

      "cursor-open": Selection.open,
      "cursor-open-in-new-tab": Selection.openInNewTab,
      "cursor-toggle-selected": Selection.toggleSelected,

      "cursor-favorite": Selection.favorite,

      "save-search": () => $("#save-search").click(),
    });

    this.bind([
      { "q": "header-focus-search" },
      { "h t": "header-toggle" },
      { "h h": "header-focus-search" },

      { "S": "save-search" },

      { "g :": "goto-page-dialog" },
      { "g 0": "goto-last-page" },
      { "g 1": "goto-page" },
      { "g 2": "goto-page" },
      { "g 3": "goto-page" },
      { "g 4": "goto-page" },
      { "g 5": "goto-page" },
      { "g 6": "goto-page" },
      { "g 7": "goto-page" },
      { "g 8": "goto-page" },
      { "g 9": "goto-page" },

      { "g g": "go-top" },
      { "G":   "go-bottom" },
      { "g f": "go-forward" },
      { "g b": "go-back" },

      { "g h": "go-my-account" },
      { "g d": "go-my-dmails" },
      { "g F": "go-my-favorites" },
      { "g s": "go-my-settings" },
      { "g S": "go-my-saved-searches" },

      { "g a": "go-artists-index" },
      { "g B": "go-bur-new" },
      { "g c": "go-comments-index" },
      { "g f": "go-forum-index" },
      { "g P": "go-pools-index" },
      { "g p": "go-post-index" },
      { "g w": "go-wiki-index" },

      { "1": "switch-to-tag-script" },
      { "2": "switch-to-tag-script" },
      { "3": "switch-to-tag-script" },
      { "4": "switch-to-tag-script" },
      { "5": "switch-to-tag-script" },
      { "6": "switch-to-tag-script" },
      { "7": "switch-to-tag-script" },
      { "8": "switch-to-tag-script" },
      { "9": "switch-to-tag-script" },

      { "shift+a": "apply-tag-script" },
      { "ctrl+a": "select-all" },
      { "ctrl+i": "invert-selection" },
      { "`": "set-preview-mode" },
      { "~": "set-preview-mode" },
 
      { "up": "move-cursor-up" },
      { "right": "move-cursor-right" },
      { "down": "move-cursor-down" },
      { "left": "move-cursor-left" },

      { "shift+up": "move-cursor-up" },
      { "shift+right": "move-cursor-right" },
      { "shift+down": "move-cursor-down" },
      { "shift+left": "move-cursor-left" },

      { "return": "cursor-open" },
      { "ctrl+return": "cursor-open-in-new-tab" },
      { "space": "cursor-toggle-selected" },

      { "clear": "cursor-toggle-selected" }, // Numpad 5
      { "del": "apply-tag-script" }, // Numpad Period
      { "*": "select-all" }, // Numpad Multiply

      { "f": "cursor-favorite" },
    ]);

    // XXX don't hardcode these
    Mousetrap.bindGlobal("esc", Keys.escape);
    Mousetrap.bindGlobal("ctrl+return", Keys.submitForm);

    // XXX figure out how to unbind W/S properly.
    //$(document).unbind("keydown", "w s");
    //Mousetrap.bind("w", Keys.scroll(+1, 50, 0.06));
    //Mousetrap.bind("s", Keys.scroll(-1, 50, 0.06));
    // Danbooru.Shortcuts.nav_scroll_down = Navigation.scroll(+1, 50, 0.06);
    // Danbooru.Shortcuts.nav_scroll_up   = Navigation.scroll(-1, 50, 0.06);
  }

  /* Actions */

  static escape(event) {
    const $target = $(event.target);
    
    if ($target.is("input, textarea")) {
      $target.blur();
    } else {
      $('#close-notice-link').click();
      // XXX only do if no notice and not already in view mode.
      ModeMenu.setMode("view");
    }

    // Allow event to bubble up so that escape still closes jquery UI dialogs.
    return true;
  }

  static submitForm(event) {
    const $target = $(event.target);

    if ($target.is("#ex-tags:focus")) {
      Header.executeSearchInNewTab();
    } else if ($target.is("input, textarea")) {
      $target.closest("form").find('input[type="submit"][value="Submit"]').click();
    }

    return false;
  }
}

class Notes {
  static initialize() {
    $(Notes.initializeLivePreview);
  }

  static initializeLivePreview() {
    Danbooru.Note.Edit.show = _.wrap(Danbooru.Note.Edit.show, (show, ...args) => {
      show(...args);

      $(".note-edit-dialog textarea").off("input").on("input", _.throttle(Notes.updatePreview, 32));
    });
  }

  static updatePreview(event) {
    const $textarea = $(event.target);
    const note_id = $textarea.closest(".ui-dialog-content").data("id");
    const $note_body = Danbooru.Note.Body.find(note_id);
    const $note_box = Danbooru.Note.Box.find(note_id);

    Danbooru.Note.Body.set_text($note_body, $note_box, $textarea.val());
    Danbooru.Note.Body.show(note_id);
  }
}

class PostPreviews {
  // Show post previews when hovering over post #1234 links.
  static initializePostLinkPreviews() {
    const posts = $('a[href^="/posts/"]').filter((i, e) => /post #\d+/.test($(e).text()));
    PostPreviews.initialize(posts);
  }

  // Show post previews when hovering over thumbnails.
  static initializeThumbnailPreviews() {
    // The thumbnail container is .post-preview on every page but comments and
    // the mod queue. Handle those specially.
    const posts = `
      .post-preview:not(.ex-no-tooltip) > a > img,
      #c-comments .post-preview > .preview > a > img,
      #c-post-moderator-queues .mod-queue-preview aside img
    `;

    PostPreviews.initialize(posts);
  }

  static initialize(selector) {
    $(document).on('mouseover', selector, event => {
      const delay = EX.config.thumbnailPreviewDelay;
      const [, postID] = $(event.target).closest("a").attr("href").match(/\/posts\/(\d+)/);

      $(event.target).qtip({
        content: {
          text: (event, api) => {
            Post.get(postID).then(post => {
              User.get(post.uploader_id).then(uploader => {
                api.set("content.text", Posts.renderExcerpt(post, uploader));
                api.reposition(event, false);
              });
            });

            return "Loading...";
          }
        },
        events: {
          show: (event) => {
            if (PreviewPanel.opened()) {
              event.preventDefault();
            }
          }
        },
        overwrite: false,
        style: {
          classes: "qtip-bootstrap",
          tip: {
            corner: false,
          }
        },
        show: {
          delay: delay,
          solo: true,
          event: event.type,
          ready: true
        },
        hide: {
          delay: 100,
          fixed: true,
        },
        position: {
          my: "top left",
          at: "top right",
          viewport: $("#ex-viewport"),
          effect: false,
          adjust: {
            method: "flipinvert shift",
            resize: false,
            scroll: false,
            x: 10,
          }
        }
      }, event);
    });
  }
}

class Sidebar {
  static initialize() {
    let $sidebar = Sidebar.$panel;

    if ($sidebar.length === 0) {
      return;
    }
    
    $sidebar.parent().addClass("ex-panel-container");
    $sidebar.addClass("ex-panel");

    const width = _.defaultTo(EX.config.sidebarState[EX.config.pageKey()], EX.config.defaultSidebarWidth);
    Sidebar.width = width;

    $sidebar.after(`
      <div id="ex-sidebar-resizer" class="ex-vertical-resizer"></div>
    `);

    $("#ex-sidebar-resizer").draggable({
      axis: "x",
      helper: "clone",
      drag: _.throttle(Sidebar.resize, 16),
      stop: _.debounce(Sidebar.save, 100),
    });
  }

  static resize(event, ui) {
    const width = Math.max(0, ui.position.left - Sidebar.$panel.position().left);
    Sidebar.width = width;
  }

  static open() {
    if (Sidebar.width === 0) {
      Sidebar.width = EX.config.defaultSidebarWidth;
    }

    Sidebar.$panel.show({ effect: "slide", direction: "right" }).promise().then(Sidebar.save);
  }

  static close() {
    Sidebar.$panel.hide({ effect: "slide", direction: "left" }).promise().then(Sidebar.save);
  }

  static save() {
    let state = EX.config.sidebarState;
    state[EX.config.pageKey()] = Math.max(0, Sidebar.width);
    EX.config.sidebarState = state;
  }

  static get $panel() {
    return $("#sidebar");
  }

  static get width() {
    return Sidebar.$panel.width();
  }

  static set width(width) {
    Sidebar.$panel.width(width);
    Sidebar.$panel.toggle(Sidebar.$panel.width() > 0);
  }
}

var Artist = Resource.Artist = class Artist extends Resource {
  static get primaryKey() { return "id"; }
};

class Artists {
  static initialize() {
    if ($("#c-artists #a-index").length) {
      Artists.replaceIndex();
    }
  }

  static replaceIndex() {
    let $table = $("#c-artists #a-index > table:nth-child(2)");

    let artists = _($table.find("> tbody > tr")).map(e => ({
      id:   $(e).attr("id").match(/artist-(\d+)/)[1],
      name: $(e).find("> td:nth-child(1) > a:nth-child(1)").text()
    }));

    let requests = [
      Artist.search(artists.map("id"), { order: UI.query("search[order]") }),
      Tag.search(artists.map("name"), { hide_empty: "no" }),
      Artist.index({ search: { is_active: true, order: "created_at" }, limit: 8 }),
      Artist.index({ search: { is_active: true, order: "updated_at" }, limit: 8 }),
      Artist.index({ search: { is_active: false, order: "updated_at" }, limit: 8 }),
    ];

    Promise.all(requests).then(([artists, tags, created, updated, deleted]) => {
      artists = artists.map(artist =>
        _.merge(artist, {
          tag: _(tags).find(["name", artist.name])
        })
      );

      let $paginator = $(".paginator");

      const index = Artists.renderIndex(artists, created, updated, deleted);
      $("#c-artists #a-index").addClass("ex-index").html(index);

      $paginator.appendTo("#content");
    });
  }

  static renderIndex(artists, created, updated, deleted) {
    return `
    <aside id="sidebar">
      ${Artists.renderSidebar(created, updated, deleted)}
    </aside>

    <section id="content">
      ${Artists.renderTable(artists)}
    </section>
    `;
  }

  static renderSidebar(created, updated, deleted) {
    return `
    <section class="ex-artists-search">
      ${Artists.renderSearchForm()}
    </section>

    <section class="ex-artists-recent-changes">
      ${Artists.renderRecentChanges(created, updated, deleted)}
    </section>
    `;
  }

  static renderSearchForm() {
    return `
    <h1>Search</h1>

    <form class="simple_form" action="/artists" accept-charset="UTF-8" method="get">
      <input name="utf8" type="hidden" value="✓">

      <label for="search_name">Name</label>
      <input type="text" name="search[name]"
            id="search_name" class="ui-autocomplete-input" autocomplete="off"
            placeholder="Search artist name or URL">

      <label for="search_order">Order</label>
      <select name="search[order]" id="search_order">
        <option value="created_at">Recently created</option>
        <option value="updated_at">Last updated</option>
        <option value="name">Name</option>
      </select>

      <input type="submit" name="commit" value="Search">
    </form>
    `;
  }

  static renderRecentChanges(created, updated, deleted) {
    function renderArtistsList(artists, heading, params) {
      return `
      <section class="ex-artists-list">
        <div class="ex-artists-list-heading">
          <h2>${heading}</h2>
          <span>
            (${UI.linkTo("more", "/artists", { search: params })})
          </span>
        </div>
        <ul>
          ${renderUl(artists)}
        </ul>
      </section>
      `;
    }

    function renderUl(artists) {
      return _(artists).map(artist => `
        <li class="category-1">
          ${UI.linkTo(artist.name, `/artists/${artist.id}`)}

	  <time class="ex-short-relative-time"
                datetime="${artist.updated_at}"
                title="${moment(artist.updated_at).format()}">
            ${moment(artist.updated_at).locale("en-short").fromNow()}
          </time>
        </li>
      `).join("");
    }

    return `
    <h1>Recent Changes</h1>

    ${renderArtistsList(created, "New Artists",     { is_active: true,  order: "created_at" })}
    ${renderArtistsList(updated, "Updated Artists", { is_active: true,  order: "updated_at" })}
    ${renderArtistsList(deleted, "Deleted Artists", { is_active: false, order: "updated_at" })}
    `;
  }

  static renderTable(artists) {
    return `
    <table class="ex-artists striped" width="100%">
      <thead>
        <tr>
          <th class="ex-artist-id">ID</th>
          <th class="ex-artist-name">Name</th>
          <th class="ex-artist-post-count">Posts</th>
          <th class="ex-artist-other-names">Other Names</th>
          <th class="ex-artist-group-name">Group</th>
          <th class="ex-artist-status">Status</th>
          <th class="ex-artist-created">Created</th>
          <th class="ex-artist-updated">Updated</th>
        </tr>
      </thead>
      <tbody>
        ${artists.map(Artists.renderRow).join("")}
      </tbody>
    </table>
    `;
  }

  static renderRow(artist) {
    const otherNames =
      (artist.other_names || "")
      .split(/\s+/)
      .sort()
      .map(name =>
        UI.linkTo(name, "/artists", { search: { name: name }}, "ex-artist-other-name")
      )
      .join(", ");

    const groupLink = UI.linkTo(
      artist.group_name, "/artists", { search: { name: `group:${artist.group_name}` }}, "ex-artist-group-name"
    );

    return `
    <tr class="ex-artist">
      <td class="ex-artist-id">
	${UI.linkTo(`artist #${artist.id}`, `/artists/${artist.id}`)}
      </td>
      <td class="ex-artist-name category-${artist.tag.category}">
	${UI.linkTo("?", "/wiki_pages", { title: artist.name }, "wiki-link")}
	${UI.linkTo(artist.name, `/artists/${artist.id}`, {}, "artist-link")}
      </td>
      <td class="ex-artist-post-count">
	${UI.linkTo(artist.tag.post_count, "/posts", { tags: artist.name }, "search-tag")}
      </td>
      <td class="ex-artist-other-names">
	${otherNames}
      </td>
      <td class="ex-artist-group-name">
	${artist.group_name ? groupLink : ""}
      </td>
      <td class="ex-artist-status">
	${artist.is_banned ? "Banned" : ""}
	${artist.is_active ? ""       : "Deleted"}
      </td>
      <td class="ex-artist-created">
	${moment(artist.created_at).fromNow()}
      </td>
      <td class="ex-artist-updated">
	${moment(artist.updated_at).fromNow()}
      </td>
    </tr>
    `;
  }
}

class Comments {
  static initialize() {
    if ($("#c-comments").length || $("#c-posts #a-show").length) {
      $(function () {
        Comments.initializePatches();
        Comments.initializeMetadata($(".comments-for-post"));
      });
    }
  }

  static initializePatches() {
    $(window).on("danbooru:index_for_post", (event, post_id) => {
      const $parent = $(`.comments-for-post[data-post-id=${post_id}]`);
      Comments.initializeMetadata($parent);
    });
  }

  /*
   * Add 'comment #1234' permalink.
   * Add comment scores.
   */
  static initializeMetadata($parent) {
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

class PostVersions {
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

var PostCount = Resource.PostCount = class PostCount extends Resource {
  static get primaryKey() { return "id"; }
  static get controller() { return "/counts/posts"; }

  static count(query) {
    return PostCount.index({ tags: query }).then(response => response.counts.posts);
  }
};

class SavedSearches {
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

class Users {
  static get QTIP_SETTINGS() {
    return {
      overwrite: false,
      style: {
        classes: "qtip-bootstrap",
        tip: { corner: false },
      },
      show: {
        solo: true,
        ready: true
      },
      hide: {
        delay: 100,
        fixed: true,
      },
      position: {
        my: "top left",
        at: "top right",
        effect: false,
        adjust: {
          method: "flipinvert shift",
          resize: false,
          scroll: false,
          x: 10,
        }
      }
    };
  }

  static initialize() {
    this.initializeWordBreaks();

    if ($("#c-users #a-show").length) {
      this.initializeCollapsibleHeaders();
      this.initializeExpandableGalleries();
    }
  }

  // Wordbreak long usernames (e.g. GiantCaveMushroom) by inserting
  // wordbreaks at lowercase -> non-lowercase transitions.
  static initializeWordBreaks() {
    this.userLinks().html((i, name) =>
      name.replace(/([a-z])(?=[^a-z])/g, c => c + "<wbr>")
    );
  }

  // Add tooltips to usernames. Also add data attributes for custom CSS styling.
  static initializeUserTooltips() {
    // XXX triggers on Profile / Settings links on /static/site_map
    $(document).on("mouseover", '#page a[href^="/users/"]', e => {
        const $user = $(e.target);
        const userId = Users.parseUserId($user);

        if (userId === null) {
            return;
        }

        const qtipParams = _.merge(Users.QTIP_SETTINGS, {
          show: { event: e.type },
          position: { viewport: $("#ex-viewport") },
          content: {
            text: (event, api) => {
              User.get(userId).then(user => {
                api.set("content.text", Users.renderExcerpt(user));
                api.reposition(event, false);
              });

              return "Loading...";
            },
          }
        });

        $user.qtip(qtipParams);
    });
  }

  static initializeCollapsibleHeaders () {
    $("#c-users #a-show > .box").each((i, e) => {
      const $gallery = $(e);

      // Make gallery headers collapsible.
      const $toggleCollapse = $(`<a class="ui-icon ui-icon-triangle-1-s collapsible-header"></a>`);
      $gallery.find("h2").prepend($toggleCollapse);

      $toggleCollapse.click(event => {
        $(event.target).closest("h2").next("div").slideToggle();
        $(event.target).toggleClass('ui-icon-triangle-1-e ui-icon-triangle-1-s');
        return false;
      });
    });
  }

  static initializeExpandableGalleries() {
    const user = $("#a-show > h1 > a").text().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(" ", "_");

    // Rewrite /favorites link into ordfav: search so it's consistent with other post sections.
    $(".box a[href^='/favorites?user_id=']").attr(
      "href", `/posts?tags=ordfav:${encodeURIComponent(user)}`
    );

    $("#c-users #a-show > .box").each((i, e) => {
      const $gallery = $(e).addClass("ex-post-gallery");

      // Store the tag search corresponding to this gallery section in a data
      // attribute for the click handler.
      const [, tags] = $gallery.find('h2 a[href^="/posts"]').attr("href").match(/\/posts\?tags=(.*)/);
      $gallery.attr("data-tags", decodeURIComponent(tags));

      $gallery.find("> div").append(`
        <article class="ex-text-thumbnail">
          <a href="#">More »</a>
        </article>
      `);

      $gallery.find(".ex-text-thumbnail a").click(event => {
        const $gallery = $(event.target).closest(".ex-post-gallery");

        const limit = 30;
        const page = Math.trunc($gallery.find(".post-preview").children().length / limit) + 1;

        Post.index({ tags: $gallery.data("tags"), page, limit }).then(posts => {
          const html = posts.map(Posts.preview).join("");

          // Hide the original posts to avoid appending duplicate posts.
          $gallery.find("> div .post-preview:not(.ex-post-preview)").hide();

          // Append new posts, moving the "More »" link to the end.
          const $more = $gallery.find(".ex-text-thumbnail").detach();
          $gallery.find("> div").append(html, $more);

          $gallery.find(".ex-post-preview").trigger("ex.post-preview:create");
        });

        return false;
      });
    });
  }

  static renderExcerpt(user) {
    return `
      <section class="ex-excerpt ex-user-excerpt">
        <div class="ex-excerpt-title ex-user-excerpt-title">
          <span class="user-info">${User.render(user)}</span>
        </div>
        <div class="ex-excerpt-body ex-user-excerpt-body">
          <dl class="info">
            <dt>Joined</dt>
            <dd>${moment(user.created_at).fromNow()}</dd>
          </dl>
          <dl class="info">
            <dt>Uploads</dt>
            <dd>${user.post_upload_count}</dd>
          </dl>
          <dl class="info">
            <dt>Edits</dt>
            <dd>${user.post_update_count}</dd>
          </dl>
          <dl class="info">
            <dt>Notes</dt>
            <dd>${user.note_update_count}</dd>
          </dl>
          <dl class="info">
            <dt>Comments</dt>
            <dd>${user.comment_count}</dd>
          </dl>
          <dl class="info">
            <dt>Forum Posts</dt>
            <dd>${user.forum_post_count}</dd>
          </dl>
        </div>
      </section>
    `;
  }

  static userLinks() {
    return $('#page a[href^="/users/"]').filter((i, e) => this.parseUserId($(e)));
  }

  static parseUserId($user) {
    return _.nth($user.attr("href").match(/^\/users\/(\d+)$/), 1);
  }
}

class WikiPages {
  static initialize() {
    if ($("#c-wiki-pages").length === 0) {
      return;
    }

    WikiPages.initializeCollapsibleHeadings();
    WikiPages.initializeTableOfContents();
  }

  // Add collapse/expand button to headings.
  static initializeCollapsibleHeadings() {
    const $headings = $("#wiki-page-body :header");

    if ($headings.length < 3) {
      return;
    }

    $headings.prepend($('<a class="ui-icon ui-icon-triangle-1-s collapsible-header"></a>'));
    $headings.find("a.collapsible-header").click(e => {
      const $button = $(e.target);

      // Collapse everything up to the next heading at the same
      // level, or up to the alias/implication list at the bottom of the page.
      $button.toggleClass('ui-icon-triangle-1-e ui-icon-triangle-1-s');
      $button.parent('h1').nextUntil('p.hint, h1').slideToggle();
      $button.parent('h2').nextUntil('p.hint, h1, h2').slideToggle();
      $button.parent('h3').nextUntil('p.hint, h1, h2, h3').slideToggle();
      $button.parent('h4').nextUntil('p.hint, h1, h2, h3, h4').slideToggle();
      $button.parent('h5').nextUntil('p.hint, h1, h2, h3, h4, h5').slideToggle();
      $button.parent('h6').nextUntil('p.hint, h1, h2, h3, h4, h5, h6').slideToggle();
    });
  }

  // Add Table of Contents expandable.
  static initializeTableOfContents() {
    const $headings = $("#wiki-page-body :header");

    const hasToC =
      $("div.expandable-header > span")
      .filter((i, e) => $(e).text().match(/table of contents/i))
      .length > 0;

    if ($headings.length < 3 || hasToC) {
      return;
    }

    const $toc =
      DText.createExpandable(
        'Table of Contents',
        '<p class="tn">This table of contents was autogenerated by Danbooru EX.</p> <ul></ul>'
      ).prependTo('#wiki-page-body');

    // Build ToC. Create a nested heirarchy matching the hierarchy of
    // headings on the page; an h5 following an h4 opens a new submenu,
    // another h4 closes the submenu. Likewise for h5, h6, etc.
    let $submenu = null;
    let $menu = $toc.find('ul');
    let level = $headings.length > 0
              ? parseInt($headings.first().get(0).tagName[1])
              : undefined;

    $headings.each((i, e) => {
      const header = $(e).text();
      const anchor =
        'dtext-' + header.toLowerCase()
                    .replace(/[^a-z]+/g, '-')
                    .replace(/^-|-$/, '');

      const nextLevel = parseInt(e.tagName[1]);
      if (nextLevel > level) {
        $submenu = $('<ul></ul>');
        $menu.append($submenu);
        $menu = $submenu;
      } else if (nextLevel < level) {
        $menu = $menu.parent();
      }

      $(e).attr('id', anchor);
      $menu.append($(`<li><a href="#${anchor}">${header}</a></li>`));

      level = nextLevel;
    });
  }
}

class UI {
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

___$insertStyle("#ex-header {\n  position: absolute;\n  top: 0;\n  padding: 5px 0;\n  width: 100%;\n  z-index: 100;\n  background: white;\n  border-bottom: 1px solid white; }\n  #ex-header .ex-header-wrapper {\n    display: flex; }\n    #ex-header .ex-header-wrapper.ex-fixed.ex-header-scrolled {\n      border-bottom: 1px solid #EEEEEE;\n      box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1); }\n    #ex-header .ex-header-wrapper h1 {\n      display: inline-block;\n      font-size: 2.5em;\n      margin: 0 30px; }\n    #ex-header .ex-header-wrapper .ex-search-box {\n      margin: auto;\n      display: flex;\n      flex: 0 1 30%; }\n      #ex-header .ex-header-wrapper .ex-search-box input#ex-tags {\n        flex: 0 1 100%; }\n      #ex-header .ex-header-wrapper .ex-search-box input[type=\"submit\"] {\n        flex: 1;\n        margin: auto 1em; }\n    #ex-header .ex-header-wrapper .ex-mode-menu {\n      margin: auto;\n      flex: 1 2 70%; }\n      #ex-header .ex-header-wrapper .ex-mode-menu .ex-tag-script-controls {\n        display: inline-block;\n        margin: auto; }\n      #ex-header .ex-header-wrapper .ex-mode-menu label {\n        font-weight: bold;\n        cursor: auto; }\n        @media (max-width: 1280px) {\n          #ex-header .ex-header-wrapper .ex-mode-menu label {\n            display: none; } }\n    #ex-header .ex-header-wrapper .ex-header-close {\n      margin: auto;\n      margin-right: 30px;\n      color: #0073ff;\n      cursor: pointer; }\n\n@media (max-width: 1280px) {\n  header h1 {\n    font-size: 1.5em !important; } }\n\nh1.ex-small-header {\n  font-size: 1.5em !important; }\n\n/* Fix sidebar search box from rendering on top of EX header bar. */\n#page #sidebar input[type=\"text\"] {\n  z-index: 10 !important; }\n\n/* /posts/1234 */\n/* Move artist tags to top of the tag list. */\n#tag-list {\n  /*\n     * Break tags that are too long for the tag list (e.g.\n     * kuouzumiaiginsusutakeizumonokamimeichoujin_mika)\n     */\n  word-break: break-word; }\n  #tag-list .ex-tag-list-header h1, #tag-list .ex-tag-list-header h2 {\n    display: inline-block; }\n  #tag-list .ex-tag-list-header .post-count {\n    margin-left: 0.5em; }\n\n/*\n * Make the parent/child thumbnail container scroll vertically, not horizontally, to prevent\n * long child lists from blowing out the page width.\n */\n#has-parent-relationship-preview,\n#has-children-relationship-preview {\n  overflow: auto;\n  white-space: initial; }\n\n#c-posts #a-show {\n  /*\n    #image-container {\n        position: relative;\n        display: inline-block;\n\n        .desc {\n            display: none;\n        }\n    }\n\n    #note-container {\n        position: initial;\n\n        .note-box {\n            background: hsla(60,100%,97%,0.5);\n            outline: 1px solid white;\n            border: 1px solid black;\n            box-sizing: border-box;\n\n            .note-box-inner-border {\n                display: none;\n            }\n        }\n    }\n*/ }\n\n.ex-fit-width {\n  max-width: 100%;\n  height: auto !important; }\n\n.ex-post-gallery span h2 {\n  display: inline-block; }\n\n.ex-text-thumbnail {\n  display: inline-block;\n  float: left;\n  height: 154px;\n  width: 154px;\n  margin: 0 10px 10px 0;\n  text-align: center;\n  background: #EEEEEE;\n  border: 2px solid #DDDDDD; }\n  .ex-text-thumbnail a {\n    display: inline-block;\n    width: 100%;\n    height: 100%;\n    line-height: 154px; }\n\n.ex-panel-container {\n  display: flex;\n  min-height: 100vh; }\n  .ex-panel-container .ex-panel {\n    flex: 0 0 auto;\n    overflow: auto;\n    align-self: start; }\n  .ex-panel-container .ex-content-panel {\n    flex: 1 1;\n    margin-left: 0px !important; }\n  .ex-panel-container #ex-preview-panel {\n    position: sticky;\n    top: 3em;\n    max-height: calc(100vh - 127px);\n    overflow-y: auto;\n    overflow-x: hidden;\n    overscroll-behavior-y: contain; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar {\n      width: 5px;\n      height: 5px; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar-button {\n      width: 0px;\n      height: 0px; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar-thumb {\n      background: #999999;\n      border: 0px none #FFFFFF;\n      border-radius: 0px; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar-thumb:hover {\n      background: #AAAAAA; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar-thumb:active {\n      background: #AAAAAA; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar-track {\n      background: #EEEEEE;\n      border: 0px none #ffffff;\n      border-radius: 0px; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar-track:hover {\n      background: #EEEEEE; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar-track:active {\n      background: #EEEEEE; }\n    .ex-panel-container #ex-preview-panel::-webkit-scrollbar-corner {\n      background: transparent; }\n    .ex-panel-container #ex-preview-panel .ex-no-image-selected {\n      text-align: center;\n      margin-top: 2em; }\n    .ex-panel-container #ex-preview-panel .ex-preview-panel-post {\n      font-size: 0.85714em;\n      line-height: 1.2em;\n      margin: 0 1em; }\n      .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata {\n        max-height: 9.95em;\n        margin-bottom: 1em;\n        overflow-y: auto; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar {\n          width: 5px;\n          height: 5px; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar-button {\n          width: 0px;\n          height: 0px; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar-thumb {\n          background: #999999;\n          border: 0px none #FFFFFF;\n          border-radius: 0px; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar-thumb:hover {\n          background: #AAAAAA; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar-thumb:active {\n          background: #AAAAAA; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar-track {\n          background: #EEEEEE;\n          border: 0px none #ffffff;\n          border-radius: 0px; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar-track:hover {\n          background: #EEEEEE; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar-track:active {\n          background: #EEEEEE; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata::-webkit-scrollbar-corner {\n          background: transparent; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata .ex-preview-panel-post-title .fav-count {\n          margin-right: 0.25em; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata .ex-preview-panel-post-title .post-info {\n          margin-right: 1em;\n          color: #333;\n          white-space: nowrap; }\n          .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-metadata .ex-preview-panel-post-title .post-info h1 {\n            color: #000;\n            display: inline;\n            font-size: 1em;\n            margin-right: 0.25em; }\n      .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-body {\n        display: flex;\n        flex-direction: column; }\n        .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-body article.post-preview {\n          width: auto;\n          height: auto;\n          margin: auto;\n          justify-content: center; }\n          .ex-panel-container #ex-preview-panel .ex-preview-panel-post .ex-preview-panel-post-body article.post-preview img {\n            object-fit: scale-down;\n            max-width: 100%;\n            max-height: calc(90vh - 127px); }\n  .ex-panel-container .ex-vertical-resizer {\n    cursor: col-resize;\n    flex: 0 0 1px;\n    border: 0.5em solid white;\n    background: #ededed;\n    transition: background 0.125s; }\n    .ex-panel-container .ex-vertical-resizer:hover {\n      background: #cccccc;\n      transition: background 0.125s; }\n\n.ex-tag-list.ex-tag-list-inline {\n  word-break: break-all; }\n  .ex-tag-list.ex-tag-list-inline h1 {\n    display: inline;\n    font-size: 1em; }\n  .ex-tag-list.ex-tag-list-inline ul {\n    display: inline; }\n    .ex-tag-list.ex-tag-list-inline ul li {\n      display: inline-block;\n      margin-right: 0.5rem; }\n\n#ex-viewport {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  visibility: hidden;\n  margin: 4em; }\n\n.post-media {\n  max-width: 100%;\n  max-height: 100%;\n  width: auto;\n  height: auto;\n  box-sizing: border-box;\n  object-fit: contain; }\n\n/*\n.qtip {\n    max-width: 720px;\n    max-height: none;\n    border-width: 2px;\n    box-sizing: border-box;\n\n    .ex-excerpt {\n        &-title {\n            font-size: 1em;\n            margin-bottom: 1em;\n            padding-bottom: 1em;\n            border-bottom: 1px solid $dim-border-color;\n\n            // Baseline align the title so the bottom margin/padding is correct.\n            // https://blogs.adobe.com/webplatform/2014/08/13/one-weird-trick-to-baseline-align-text/\n            &::first-line {\n                line-height: 0px;\n            }\n\n            &::before {\n                content: \"\";\n                display: inline-block;\n                height: $line-height;\n            }\n        }\n\n      &-body {\n          display: flex;\n          flex-direction: row;\n      }\n    }\n\n    ::-webkit-scrollbar {\n        width: 5px;\n        height: 5px;\n    }\n    ::-webkit-scrollbar-button {\n        width: 0px;\n        height: 0px;\n    }\n    ::-webkit-scrollbar-thumb {\n        background: #999999;\n        border: 0px none #ffffff;\n        border-radius: 0px;\n    }\n    ::-webkit-scrollbar-thumb:hover {\n        background: #AAAAAA;\n    }\n    ::-webkit-scrollbar-thumb:active {\n        background: #AAAAAA;\n    }\n    ::-webkit-scrollbar-track {\n        background: $dim-border-color;\n        border: 0px none #ffffff;\n        border-radius: 0px;\n    }\n    ::-webkit-scrollbar-track:hover {\n        background: $dim-border-color;\n    }\n    ::-webkit-scrollbar-track:active {\n        background: $dim-border-color;\n    }\n    ::-webkit-scrollbar-corner {\n        background: transparent;\n    }\n}\n*/\n.post-media {\n  max-width: 100%;\n  max-height: 100%;\n  width: auto;\n  height: auto;\n  box-sizing: border-box;\n  object-fit: contain; }\n\n.qtip .ex-post-excerpt-title .post-info {\n  color: #333; }\n  .qtip .ex-post-excerpt-title .post-info.id {\n    color: #333;\n    font-weight: bold; }\n\n.qtip .ex-post-excerpt-body {\n  max-height: 350px; }\n\n.qtip .ex-post-excerpt-preview {\n  flex: 0 1;\n  width: auto;\n  height: auto;\n  overflow: visible; }\n\n.qtip .ex-post-excerpt-metadata {\n  flex: 1 1;\n  overflow-y: auto; }\n\n.qtip .ex-user-excerpt-body dl.info {\n  margin-right: 2em; }\n\n.ex-fixed {\n  position: fixed !important; }\n\n/* Overrides for Danbooru's responsive layout */\n@media screen and (max-width: 660px) {\n  body {\n    overflow-x: hidden; }\n  #ex-header input {\n    font-size: 1em; }\n  #ex-header {\n    text-align: initial;\n    line-height: initial; }\n  #nav {\n    display: block;\n    float: none;\n    font-size: 1em; }\n  header#top menu {\n    width: initial; }\n  header#top menu li a {\n    padding: 6px 5px; }\n  .ex-preview-panel-container {\n    display: block;\n    min-height: initial; }\n  #sidebar,\n  #ex-sidebar-resizer,\n  #ex-preview-panel-resizer,\n  #ex-preview-panel {\n    display: none !important; } }\n\n#notice {\n  top: 4.5em !important; }\n\n.ex-artists {\n  white-space: nowrap; }\n\n.ex-artist .ex-artist-id {\n  width: 10%; }\n\n.ex-artist .ex-artist-other-names {\n  width: 100%;\n  white-space: normal; }\n\n#c-artists #sidebar label {\n  display: block;\n  font-weight: bold;\n  padding: 4px 0 4px 0;\n  width: auto;\n  cursor: auto; }\n\n#c-artists #sidebar input[type=\"text\"] {\n  width: 100% !important; }\n\n#c-artists #sidebar button[type=\"submit\"] {\n  display: block;\n  margin: 4px 0 4px 0; }\n\n#c-artists #sidebar h2 {\n  font-size: 1em;\n  display: inline-block;\n  margin: 0.75em 0 0.25em 0; }\n\n#c-artists #a-index {\n  opacity: 0; }\n\n.ex-index {\n  opacity: 1 !important;\n  transition: opacity 0.15s; }\n\n#c-users #a-edit #ex-settings-section label {\n  display: inline-block; }\n\nbody.mode-tag-script {\n  background-color: white; }\n\nbody.mode-tag-script #ex-header {\n  border-top: 2px solid #D6D;\n  padding-top: 3px; }\n\nbody.mode-preview #ex-header {\n  border-top: 2px solid #0073ff;\n  padding-top: 3px; }\n\nbody.mode-view #ex-preview-panel-resizer {\n  display: none; }\n\nbody.mode-tag-script article.post-preview > a, #c-moderator-post-queues .post-preview aside > a, #c-comments .post-preview .preview > a,\nbody.mode-preview article.post-preview > a, #c-moderator-post-queues .post-preview aside > a, #c-comments .post-preview .preview > a {\n  width: 100%;\n  height: 100%; }\n  body.mode-tag-script article.post-preview > a:focus, #c-moderator-post-queues .post-preview aside > a:focus, #c-comments .post-preview .preview > a:focus,\n  body.mode-preview article.post-preview > a:focus, #c-moderator-post-queues .post-preview aside > a:focus, #c-comments .post-preview .preview > a:focus {\n    outline: none; }\n\nbody.mode-preview article.post-preview:hover, body.mode-preview #c-moderator-post-queues .post-preview aside:hover, body.mode-preview #c-comments .post-preview .preview:hover, body.mode-tag-script article.post-preview:hover, body.mode-tag-script #c-moderator-post-queues .post-preview aside:hover, body.mode-tag-script #c-comments .post-preview .preview:hover {\n  opacity: 0.75; }\n\nbody.mode-tag-script article.post-preview.ui-selected, body.mode-tag-script #c-moderator-post-queues .post-preview aside.ui-selected, body.mode-tag-script #c-comments .post-preview .preview.ui-selected {\n  background: #66b3cc; }\n  body.mode-tag-script article.post-preview.ui-selected img, body.mode-tag-script #c-moderator-post-queues .post-preview aside.ui-selected img, body.mode-tag-script #c-comments .post-preview .preview.ui-selected img {\n    opacity: 0.5; }\n\n#posts-container article.post-preview {\n  padding: 0 10px 10px 0;\n  margin: 0;\n  float: left; }\n\n#posts > div {\n  padding: 2px; }\n\narticle.post-preview.ex-cursor, #c-moderator-post-queues .post-preview aside.ex-cursor, #c-comments .post-preview .preview.ex-cursor {\n  z-index: 50;\n  outline: 2px solid #409fbf;\n  background-color: #b3d9e6; }\n\n.ui-selectable-helper {\n  position: absolute;\n  z-index: 100;\n  border: 1px dotted black; }\n\n.ui-selectable {\n  -ms-touch-action: none;\n  touch-action: none; }\n\n.ex-short-relative-time {\n  color: #333;\n  margin-left: 0.2em; }\n\n.tag-post-count-empty {\n  border-bottom: 1px dotted; }\n\n.tag-dne {\n  border-bottom: 1px dotted; }\n\n/* Ensure colorized tags are still hidden. */\n.spoiler:hover a.tag-type-1 {\n  color: #A00; }\n\n.spoiler:hover a.tag-type-3 {\n  color: #A0A; }\n\n.spoiler:hover a.tag-type-4 {\n  color: #0A0; }\n\n.spoiler:not(:hover) a {\n  color: black !important; }\n\n.paginator menu li {\n  line-height: 2.5em;\n  display: inline-block; }\n\na.collapsible-header {\n  display: none;\n  cursor: pointer;\n  margin-left: -16px; }\n\nh1:hover a.collapsible-header, h2:hover a.collapsible-header, h3:hover a.collapsible-header,\nh4:hover a.collapsible-header, h5:hover a.collapsible-header, h6:hover a.collapsible-header {\n  display: inline-block !important; }\n\n#wiki-page-body h1, #wiki-page-body h2, #wiki-page-body h3,\n#wiki-page-body h4, #wiki-page-body h5, #wiki-page-body h6 {\n  padding-left: 16px;\n  margin-left: -16px; }\n");

var EX = window.EX = class EX {
  static get Config() { return Config; }
  static get DText() { return DText; }
  static get Keys() { return Keys; }
  static get Resource() { return Resource; }
  static get UI() { return UI; }

  static get logLevel() { return 1; }

  static initialize() {
    // console.timeEnd("preinit");
    // console.groupCollapsed("settings");

    EX.version = GM_info.script.version;
    EX.config = new EX.Config();
    EX.keys = new EX.Keys();

    if (EX.config.enableHotkeys) { EX.keys.initialize(); }

    EX.config.enableHeader && UI.Header.initialize();
    EX.config.resizeableSidebars && UI.Sidebar.initialize();
    EX.config.showThumbnailPreviews && UI.PostPreviews.initializeThumbnailPreviews();
    // EX.config.showPostLinkPreviews && UI.PostPreviews.initializePostLinkPreviews();
    EX.UI.initialize();
    EX.config.enableNotesLivePreview && EX.UI.Notes.initialize();
    EX.config.usernameTooltips && EX.UI.Users.initializeUserTooltips();
    EX.config.enableLargeThumbnails && EX.UI.Posts.initializeLargeThumbnails();

    EX.config.artistsRedesign && EX.UI.Artists.initialize();
    EX.config.commentsRedesign && EX.UI.Comments.initialize();
    EX.config.postsRedesign && EX.UI.Posts.initialize();
    EX.config.postVersionsRedesign && EX.UI.PostVersions.initialize();
    EX.config.wikiRedesign && EX.UI.WikiPages.initialize();
    EX.config.usersRedesign && EX.UI.Users.initialize();
    // EX.UI.SavedSearches.initialize();

    // console.groupEnd("settings");
    // console.timeEnd("initialized");
  }

  static debug(...params) {
    if (EX.logLevel === 0) {
      console.log(...params);
    }
  }
};

window.EX.debug("Danbooru:", window.Danbooru);
// console.timeEnd("loaded");

$(function () {
  try {
    window.EX.initialize();
  } catch(e) {
    console.trace(e);
    $("footer").append(`<div class="ex-error">Danbooru EX error: ${e}</div>`);
    throw e;
  }
});

return EX;

}(_,Mousetrap,moment,ResizeSensor));
