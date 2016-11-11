// ==UserScript==
// @name         Danbooru EX
// @namespace    https://github.com/evazion/danbooru-ex
// @version      2284
// @source       https://danbooru.donmai.us/users/52664
// @description  Danbooru UI Enhancements
// @author       evazion
// @match        *://*.donmai.us/*
// @match        *://localhost/*
// @grant        none
// @run-at       document-body
// @downloadURL  https://github.com/evazion/danbooru-ex/raw/stable/dist/danbooru-ex.user.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.11.2/ui/selectable.js
// @require      https://raw.githubusercontent.com/jquery/jquery-ui/1.11.2/ui/tooltip.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.js
// @require      https://unpkg.com/filesize@3.3.0
// ==/UserScript==

/*
 * What is a userscript? A miserable pile of hacks.
 */

console.log("Danbooru EX:", GM_info.script.version);
console.time("loaded");
console.time("preinit");
console.time("initialized");

var danbooruEX = (function ($$1,moment$1,_$1,filesize) {
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
$$1 = 'default' in $$1 ? $$1['default'] : $$1;
moment$1 = 'default' in moment$1 ? moment$1['default'] : moment$1;
_$1 = 'default' in _$1 ? _$1['default'] : _$1;
filesize = 'default' in filesize ? filesize['default'] : filesize;

class Config {
  static get Defaults() {
    return {
      enableHeader: {
        configurable: true,
        help: "Enable header bar containing search box and mode menu.",
        value: true,
      },
      enableModeMenu: {
        configurable: true,
        help: "Enable mode menu in header bar, disable mode menu in the sidebar. Required for preview panel.",
        value: true,
      },
      enablePreviewPanel: {
        configurable: true,
        help: "Enable the post preview panel. Requires header bar and mode menu to be enabled.",
        value: true,
      },
      enableHotkeys: {
        configurable: true,
        help: "Enable additional keyboard shortcuts.",
        value: true,
      },
      showThumbnailPreviews: {
        configurable: true,
        help: "Show post preview tooltips when hovering over thumbnails.",
        value: true,
      },
      showPostLinkPreviews: {
        configurable: true,
        help: "Show post preview tooltips when hovering over post #1234 links.",
        value: true,
      },
      enableNotesLivePreview: {
        configurable: true,
        help: "Automatically update note preview as you edit.",
        value: true,
      },
      usernameTooltips: {
        configurable: true,
        help: "Enable tooltips on usernames",
        value: false,
      },
      styleWikiLinks: {
        configurable: true,
        help: "Colorize tags in the wiki and forum, underline links to empty tags, and add tooltips to tags.",
        value: true,
      },
      useRelativeTimestamps: {
        configurable: true,
        help: 'Replace fixed times ("2016-08-10 23:25") with relative times ("3 months ago").',
        value: true,
      },
      resizeableSidebars: {
        configurable: true,
        help: "Make the tag sidebar resizeable (drag edge to resize).",
        value: true,
      },
      autoplayVideos: {
        configurable: true,
        help: "Enable autoplay for webm and mp4 posts (normally enabled by Danbooru).",
        value: true,
      },
      loopVideos: {
        configurable: true,
        help: "Enable looping for video_with_sound posts (normally disabled by Danbooru).",
        value: true,
      },
      muteVideos: {
        configurable: true,
        help: "Mute video_with_sound posts by default.",
        value: false,
      },

      artistsRedesign: {
        configurable: true,
        help: "Enable the redesigned /artists index.",
        value: true,
      },
      commentsRedesign: {
        configurable: true,
        help: "Enable comment scores and extra info on posts in /comments",
        value: true,
      },
      forumRedesign: {
        configurable: true,
        help: 'Replace Permalinks on forum posts with "forum #1234" links',
        value: true,
      },
      postsRedesign: {
        configurable: true,
        help: 'Move artist tags to the top of the tag list, put tag counts next to tag list headers, and add hotkeys for rating / voting on posts.',
        value: true,
      },
      postVersionsRedesign: {
        configurable: true,
        help: "Add thumbnails on the /post_versions page",
        value: true,
      },
      wikiRedesign: {
        configurable: true,
        help: "Make header sections in wiki entries collapsible and add table of contents to long wiki pages",
        value: true,
      },
      usersRedesign: {
        configurable: true,
        help: "Add expandable saved searches to user account pages",
        value: true,
      },
      thumbnailPreviewDelay: {
        configurable: false,
        help: "The delay in milliseconds when hovering over a thumbnail before the preview appears.",
        value: 650,
      },

      schemaVersion: {
        configurable: false, value: 1,
      }, defaultSidebarWidth: {
        configurable: false, value: 210,
      }, defaultPreviewPanelWidth: {
        configurable: false, value: 480,
      }, sidebarState: {
        configurable: false, value: {},
      }, previewPanelState: {
        configurable: false, value: {},
      }, modeMenuState: {
        configurable: false, value: {},
      }, tagScriptNumber: {
        configurable: false, value: 1,
      }, tagScripts: {
        configurable: false,
        value: _$1.fill(Array(10), ""),
      }, headerState: {
        configurable: false, value: "ex-fixed",
      },
    };
  }

  constructor() {
    this.storage = window.localStorage;

    if ($("#c-users #a-edit").length) {
      this.initializeForm();
    }
  }

  get(key) {
    const value = JSON.parse(_$1.defaultTo(
      this.storage["EX.config." + key],
      JSON.stringify(Config.Defaults[key].value)
    ));

    console.log(`[CFG] READ EX.config.${key}:`, value);
    return value;
  }

  set(key, value) {
    this.storage["EX.config." + key] = JSON.stringify(value);
    console.log(`[CFG] SAVE EX.config.${key} =`, value);
    return this;
  }

  get all() {
    return _$1.mapValues(Config.Defaults, (v, k) => this.get(k));
  }

  reset() {
    _$1(Config.Defaults).keys().each(key => {
      delete this.storage["EX.config." + key];
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
      _$1(Config.Defaults)
      .map((props, name) => _$1.merge(props, { name }))
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
      Danbooru.notice("Setting saved.");
    });

    $("#factory_reset").click(e => {
      confirm('Reset Danbooru EX settings?') && this.reset() && Danbooru.notice("Danbooru EX reset.");
    });
  }

  renderOption(setting) {
    const name = setting.name;
    const id = "ex_config_" + _$1.snakeCase(name);
    const value = this.get(name) ? "checked" : "";

    return `
      <div class="input checkbox optional">
        <input class="boolean optional" type="checkbox" ${value} name="${_$1.camelCase(name)}" id="${id}">
        <label class="boolean optional" for="${id}">${_$1.startCase(name)}</label>
        <div class="hint">${setting.help}</div>
      </div>
    `;
  }
}

// Define getters/setters for `Config.showHeaderBar` et al.
for (let k of _$1.keys(Config.Defaults)) {
  const key = k;
  Object.defineProperty(Config.prototype, key, {
    get: function ()  { return this.get(key) },
    set: function (v) { return this.set(key, v) },
    enumerable: true,
    configurable: true,
  });
}

class DText {
  static create_expandable(name, content) {
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
        $(e.target).val((_, val) => val === 'Show' ? 'Hide' : 'Show');
        e.preventDefault();
      });
    });

    return $expandable;
  }
}

class Resource {
  static get(params) {
    const url = "/" + _$1.snakeCase(this.name.toLowerCase() + "s");
    const query = `${url}.json?${decodeURIComponent($$1.param(params))}`;
    const request = $$1.getJSON(url, params);

    console.time(`GET ${query}`);
    console.log(`[NET] GET ${query}`, request);

    return request.always(() => {
      console.timeEnd(`GET ${query}`);
      console.log(`[NET] ${request.status} ${request.statusText} ${query}`, request);
    });
  }

  static search(values, otherParams) {
    const key = this.primaryKey;
    const requests = this.batch(values).map(batch => {
      const params = _$1.merge(this.searchParams, { search: otherParams }, { search: { [key]: batch.join(",") }});
      return this.get(params);
    });

    return Promise.all(requests).then(_$1.flatten);
  }

  // Collect items in batches, with each batch having a max count of 1000 items
  // or a max combined size of 6500 bytes for all items. This is necessary
  // because these are the parameter limits for requests to the API.
  static batch(items, limit = 1000, maxLength = 6500) {
    let item_batches = [[]];
    items = _$1(items).sortBy().sortedUniq().value();

    for (let item of items) {
      const current_batch = item_batches[0];
      const next_batch = current_batch.concat([item]);

      const batch_length = next_batch.map(encodeURIComponent).join(",").length;
      const batch_count = next_batch.length;

      if (batch_count > limit || batch_length > maxLength) {
        item_batches.unshift([item]);
      } else {
        current_batch.push(item);
      }
    }

    return _$1(item_batches).reject(_$1.isEmpty).reverse().value();
  }

  static get searchParams() {
    return { limit: 1000 };
  }
}

class Posts {
  static initialize() {
    if ($("#c-posts #a-show").length === 0) {
      return;
    }

    Posts.initialize_patches();
    Posts.initializeTagList();
    Posts.initialize_hotkeys();
    Posts.initialize_video();
  }

  // Update Rating in sidebar when it changes.
  static initialize_patches() {
    function patched_update_data(update_data, data) {
      const rating = data.rating === 's' ? "Safe"
                    : data.rating === 'q' ? "Questionable"
                    : data.rating === 'e' ? "Explicit"
                    : "Unknown";

      $("#post-information > ul > li:nth-child(6)").text(`Rating: ${rating}`);
      return update_data(data);
    }

    Danbooru.Post.update_data = _$1.wrap(Danbooru.Post.update_data, patched_update_data);
  }

  static initializeTagList() {
    _$1.forOwn({
      "Artist": "artist",
      "Copyrights": "copyright",
      "Characters": "character",
      "Tags": "general",
    }, (category, heading) => {
      let $header = $('#tag-list :header').filter((i, e) => $(e).text().match(heading));
      let $tags = $header.next('ul');

      $tags.addClass(`ex-${category}-tag-list`);
      $header.wrap(`<span class="ex-tag-list-header ex-${category}-tag-list-header">`);
      $header.parent().append(`<span class="post-count">${$tags.children().size()}</span>`);
    });
  }

  /*
   * Alt+S: Rate Safe.
   * Alt+Q: Rate Questionable.
   * Alt+E: Rate Explicit.
   * U / Alt+U: Vote up / vote down.
   */
  static initialize_hotkeys() {
    const post_id = Danbooru.meta("post-id");

    const rate = function (post_id, rating) {
      return function (e) {
        Danbooru.Post.update(post_id, {"post[rating]": rating});
        e.preventDefault();
      };
    };

    $(document).keydown("alt+s", rate(post_id, 's'));
    $(document).keydown("alt+q", rate(post_id, 'q'));
    $(document).keydown("alt+e", rate(post_id, 'e'));

    $(document).keydown("u",     e => Danbooru.Post.vote('up',   post_id));
    $(document).keydown("alt+u", e => Danbooru.Post.vote('down', post_id));
  }

  static initialize_video() {
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
    let post = _$1.mapKeys(data, (v, k) => _$1.snakeCase(k));
    post.md5 = post.md_5;

    const flags = post.flags.split(/\s+/);
    post.is_pending = _$1.indexOf(flags, "pending") !== -1;
    post.is_flagged = _$1.indexOf(flags, "flagged") !== -1;
    post.is_deleted = _$1.indexOf(flags, "deleted") !== -1;

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
    preview_class += post.is_pending           ? " post-status-pending"      : "";
    preview_class += post.is_flagged           ? " post-status-flagged"      : "";
    preview_class += post.is_deleted           ? " post-status-deleted"      : "";
    preview_class += post.parent_id            ? " post-status-has-parent"   : "";
    preview_class += post.has_visible_children ? " post-status-has-children" : "";

    const data_attributes = `
      data-id="${post.id}"
      data-has-sound="${!!post.tag_string.match(/(video_with_sound|flash_with_sound)/)}"
      data-tags="${_$1.escape(post.tag_string)}"
      data-pools="${post.pool_string}"
      data-uploader="${_$1.escape(post.uploader_name)}"
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

    const src = (size === "preview") ? post.preview_file_url
              : (size === "large")   ? post.large_file_url
              : post.file_url;

    // XXX only do this if <video>.
    const autoplay = (size === "large" || EX.config.autoplayVideos) ? "autoplay" : "";
    const loop     = (size === "large" || EX.config.loopVideos)     ? "loop"     : "";
    const muted    = (size === "large" || EX.config.muteVideos)     ? "muted"    : "";

    const media = (post.file_ext.match(/webm|mp4|zip/))
                ? `<video class="post-media" ${autoplay} ${loop} ${muted} src="${src}" title="${_$1.escape(post.tag_string)}">`
                : `<img class="post-media" itemprop="thumbnailUrl" src="${src}" title="${_$1.escape(post.tag_string)}">`;

    // XXX get the tag params from the URL if on /posts.
    const tag_params = "";

    return `
      <article itemscope itemtype="http://schema.org/ImageObject"
               id="post_${post.id}" class="${preview_class}" ${data_attributes}>
        <a href="/posts/${post.id}${tag_params}">${media}</a>
      </article>
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
      #c-notes #a-index,
      #c-pools #a-gallery,
      #c-pools #a-show,
      #c-comments #a-index,
      #c-moderator-post-queues #a-show,
      #c-users #a-show
    `);

    if ($content.length === 0) {
      return;
    }

    $content.parent().addClass("ex-preview-panel-container");
    $content.addClass("ex-content-panel");
    $content.after(`
      <section id="ex-preview-panel-resizer" class="ex-vertical-resizer"></section>
      <section id="ex-preview-panel" class="ex-panel">
        <div>
          <article>
            No image selected. Click a thumbnail to open image preview.
          </article>
        </div>
      </section>
    `);

    // XXX: sometimes a huge offset is calculated. don't know why.
    // PreviewPanel.origTop = $("#ex-preview-panel > div").offset().top;
    PreviewPanel.origTop = 127;

    const width = _$1.defaultTo(EX.config.previewPanelState[EX.config.pageKey()], EX.config.defaultPreviewPanelWidth);
    PreviewPanel.setWidth(width);
    PreviewPanel.setHeight();
    PreviewPanel.save();

    if (ModeMenu.getMode() === "view") {
      $("#ex-preview-panel").hide();
    }

    $(document).scroll(_$1.throttle(PreviewPanel.setHeight, 16));
    $('.ex-mode-menu select[name="mode"]').change(PreviewPanel.switchMode);
    $("#ex-preview-panel-resizer").draggable({
      axis: "x",
      helper: "clone",
      drag: _$1.throttle(PreviewPanel.resize, 16),
      stop: _$1.debounce(PreviewPanel.save, 100),
    });
  }

  static resize(e, ui) {
    // XXX magic number
    PreviewPanel.setWidth($("body").innerWidth() - ui.position.left - 28);
  }

  static save() {
    let state = EX.config.previewPanelState;
    state[EX.config.pageKey()] = $("#ex-preview-panel").width();
    EX.config.previewPanelState = state;
  };

  static open() {
    $("#ex-preview-panel").show({ effect: "slide", direction: "left" }).promise().then((e) => {
      PreviewPanel.save();
    });
  }

  static close() {
    $("#ex-preview-panel").hide({ effect: "slide", direction: "right" }).promise().then((e) => {
      PreviewPanel.save();
    });
  }

  static switchMode() {
    if (ModeMenu.getMode() === "view") {
      PreviewPanel.close();
    } else {
      PreviewPanel.open();
    }
  }

  static setWidth(width) {
    $("#ex-preview-panel").width(width);
    $("#ex-preview-panel > div").width(width);
  }

  static setHeight() {
    const headerHeight = $("#ex-header").outerHeight(true);
    const footerHeight = $("footer").outerHeight(true);

    let height;
    if (window.scrollY + headerHeight >= PreviewPanel.origTop) {
      $("#ex-preview-panel > div").addClass("ex-fixed").css({ top: headerHeight });
      height = `calc(100vh - ${headerHeight}px)`;
    } else {
      $("#ex-preview-panel > div").removeClass("ex-fixed");
      height = `calc(100vh - ${PreviewPanel.origTop - window.scrollY}px)`;
    }

    const diff = window.scrollY + window.innerHeight + footerHeight - $("body").height();
    if (diff >= 0) {
      height = `calc(100vh - ${headerHeight}px - ${diff}px)`;
    }

    $("#ex-preview-panel > div").css({ height });
    $("#ex-preview-panel > div > article.post-preview .post-media").css({ "max-height": height });
  }
}

class ModeMenu {
  static initialize() {
    ModeMenu.uninitializeDanbooruModeMenu();
    ModeMenu.initializeModeMenu();
    ModeMenu.initializeTagScriptControls();
    ModeMenu.initializeThumbnails();
    ModeMenu.initializeHotkeys();
  }

  static uninitializeDanbooruModeMenu() {
    Danbooru.PostModeMenu.initialize = _$1.noop;
    Danbooru.PostModeMenu.show_notice = _$1.noop;
    $(".post-preview a").unbind("click", Danbooru.PostModeMenu.click);
    $(document).unbind("keydown", "1 2 3 4 5 6 7 8 9 0", Danbooru.PostModeMenu.change_tag_script);
    $("#sidebar #mode-box").hide();
  }

  static initializeModeMenu() {
    $('.ex-mode-menu select[name="mode"]').change(ModeMenu.switchMode);
    const mode = _$1.defaultTo(EX.config.modeMenuState[EX.config.pageKey()], "view");
    ModeMenu.setMode(mode);
  }

  static initializeTagScriptControls() {
    $('.ex-mode-menu input[name="tag-script"]').on(
      "input", _$1.debounce(ModeMenu.saveTagScript, 250)
    );

    $('.ex-mode-menu select[name="tag-script-number"]').change(ModeMenu.switchTagScript);
    ModeMenu.setTagScriptNumber(EX.config.tagScriptNumber);

    $('.ex-mode-menu button[name="apply"]').click(ModeMenu.applyTagScript);
    $('.ex-mode-menu button[name="select-all"]').click(ModeMenu.selectAll);
    $('.ex-mode-menu button[name="select-invert"]').click(ModeMenu.invertSelection);
  }

  static initializeThumbnails() {
    $(`
      .mod-queue-preview aside a,
      div.post-preview .preview a,
      article.post-preview a
    `).click(ModeMenu.onThumbnailClick);

    $(document).on("ex.post-preview:create", event => {
      $(event.target).find("a").click(ModeMenu.onThumbnailClick);
    });
  }

  static initializeHotkeys() {
    $(document).keydown("1 2 3 4 5 6 7 8 9", ModeMenu.switchToTagScript);

    $(document).keydown("shift+a", ModeMenu.applyTagScript);
    $(document).keydown("ctrl+a",  ModeMenu.selectAll);
    $(document).keydown("ctrl+i",  ModeMenu.invertSelection);

    $(document).keydown("esc", e => ModeMenu.setMode("view"));
    $(document).keydown("`", e => ModeMenu.toggleMode("preview"));
    $(document).keydown("shift+`", e => ModeMenu.toggleMode("preview"));
  }

  static switchToTagScript(event) {
    const newN = Number(String.fromCharCode(event.which));
    const oldN = ModeMenu.getTagScriptNumber();

    if (ModeMenu.getMode() === "tag-script" && newN === oldN) {
      $('.ex-mode-menu input[name="tag-script"]').focus();
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
      return;
    }

    switch (ModeMenu.getMode()) {
      case "view":
        return;

      case "tag-script":
        $(event.target).closest(".ui-selectee").toggleClass("ui-selected");
        /* fallthrough */

      case "preview":
        let post = Posts.normalize($(event.target).closest(".post-preview").data());

        const html = Posts.preview(post, { size: "large" });
        $("#ex-preview-panel article").replaceWith(html);

        PreviewPanel.setHeight();
        event.preventDefault();
        break;
    }
  }

  static applyTagScript(event) {
    const mode = ModeMenu.getMode();

    if (mode === "tag-script") {
      const tag_script = ModeMenu.getTagScript();
      $(".ui-selected").each((i, e) => {
        const post_id = $(e).closest(".post-preview").data("id");
        Danbooru.TagScript.run(post_id, tag_script);
      });
    }
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

class Header {
  static initialize() {
    Header.initializeHeader();
    Header.initializeHotkeys();

    if (EX.config.enableModeMenu) {
      Header.initializeModeMenu();

      if (EX.config.enablePreviewPanel) {
        PreviewPanel.initialize();
      }
    }
  }

  static initializeHeader() {
    let $header = $(`
      <header style="display: none;" id="ex-header" class="${EX.config.headerState}">
        <h1><a href="/">Danbooru</a></h1>

        <form class="ex-search-box" action="/posts" accept-charset="UTF-8" method="get">
          <input type="text" name="tags" id="tags" class="ui-autocomplete-input" autocomplete="off">
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

            <input name="tag-script" type="text" placeholder="Enter tag script">
            <button name="apply" type="button">Apply</button>

            <label>Select</label>
            <button name="select-all" type="button">All/None</button>
            <button name="select-invert" type="button">Invert</button>
          </fieldset>
        </section>

	<a class="ex-header-close">
          <i class="fa fa-lg" aria-hidden="true"></i>
	</span>
      </header>
    `).insertBefore("#top");
    _.defer(() => $header.show());

    // Initalize header search box.
    $("#ex-header #tags").val($("#sidebar #tags").val());
    Danbooru.Autocomplete.initialize_all();

    $(".ex-header-close").click(Header.toggleClose);
  }

  static initializeHotkeys() {
    let $search = $("#ex-header #tags");

    $search.keydown("ctrl+return", e => {
      const tags = $(e.target).val().trim();
      window.open(`/posts?tags=${encodeURIComponent(tags)}`, "_blank").focus();
    });

    // Shift+Q: Focus and search box.
    $(document).keydown('shift+q', e => {
      // Add a space to end if box is non-empty and doesn't already have trailing space.
      $search.val().length && $search.val((i, v) => v.replace(/\s*$/, ' '));
      $search.focus();

      e.preventDefault();
    });
  }

  static initializeModeMenu() {
    $(".ex-mode-menu").show();
    ModeMenu.initialize();
  }

  static toggleClose(event) {
    let $header = $("#ex-header");

    if ($header.hasClass("ex-fixed")) {
      $header.slideUp().promise().then(e => {
        $header.toggleClass("ex-fixed ex-static").show();
        EX.config.headerState = $header.attr("class");
      });
    } else {
      $header.toggleClass("ex-fixed ex-static");
      EX.config.headerState = $header.attr("class");
    }

    event.preventDefault();
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

var Artist = Resource.Artist = class Artist extends Resource {
  static get primaryKey() { return "id"; }
};

var Tag = Resource.Tag = class Tag extends Resource {
  static get Categories() {
    return [
      "General",    // 0
      "Artist",     // 1
      undefined,    // 2 (unused)
      "Copyright",  // 3
      "Character"   // 4
    ];
  }

  static get searchParams() {
    return _$1.merge({}, super.searchParams, { search: { hide_empty: "no" }});
  }

  static get primaryKey() { return "name"; }
};

class Artists {
  static initialize() {
    if ($("#c-artists #a-show").length) {
      Artists.initialize_hotkeys();
    }

    if ($("#c-artists #a-index").length) {
      Artists.replace_index();
    }
  }

  static initialize_hotkeys() {
    $(document).keydown("e", e => UI.openEditPage('artists'));
  }

  static replace_index() {
    let $table = $("#c-artists #a-index > table:nth-child(2)");

    let artists = _($table.find("> tbody > tr")).map(e => ({
      id:   $(e).attr("id").match(/artist-(\d+)/)[1],
      name: $(e).find("> td:nth-child(1) > a:nth-child(1)").text()
    }));

    let requests = [
      Artist.search(artists.map("id"), { order: UI.query("search[order]") }),
      Tag.search(artists.map("name"), { hide_empty: "no" }),
      Artist.get({ search: { is_active: true, order: "created_at" }, limit: 8 }),
      Artist.get({ search: { is_active: true, order: "updated_at" }, limit: 8 }),
      Artist.get({ search: { is_active: false, order: "updated_at" }, limit: 8 }),
    ];

    Promise.all(requests).then(([artists, tags, created, updated, deleted]) => {
      artists = artists.map(artist =>
        _.merge(artist, {
          tag: _(tags).find(["name", artist.name])
        })
      );

      let $paginator = $(".paginator");

      const index = Artists.render_index(artists, created, updated, deleted);
      $("#c-artists #a-index").addClass("ex-index").html(index);

      $paginator.appendTo("#content");
    });
  }

  static render_index(artists, created, updated, deleted) {
    return `
    <aside id="sidebar">
      ${Artists.render_sidebar(created, updated, deleted)}
    </aside>

    <section id="content">
      ${Artists.render_table(artists)}
    </section>
    `;
  }

  static render_sidebar(created, updated, deleted) {
    return `
    <section class="ex-artists-search">
      ${Artists.render_search_form()}
    </section>

    <section class="ex-artists-recent-changes">
      ${Artists.render_recent_changes(created, updated, deleted)}
    </section>
    `;
  }

  static render_search_form() {
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

  static render_recent_changes(created, updated, deleted) {
    function render_artists_list(artists, heading, params) {
      return `
      <section class="ex-artists-list">
        <div class="ex-artists-list-heading">
          <h2>${heading}</h2>
          <span>
            (${UI.linkTo("more", "/artists", { search: params })})
          </span>
        </div>
        <ul>
          ${render_ul(artists)}
        </ul>
      </section>
      `;
    }

    function render_ul(artists) {
      return _(artists).map(artist => `
        <li class="category-1">
          ${UI.linkTo(artist.name, `/artists/${artist.id}`)}

	  <time class="ex-short-relative-time"
                datetime="${artist.updated_at}"
                title="${moment$1(artist.updated_at).format()}">
            ${moment$1(artist.updated_at).locale("en-short").fromNow()}
          </time>
        </li>
      `).join("");
    }

    return `
    <h1>Recent Changes</h1>

    ${render_artists_list(created, "New Artists",     { is_active: true,  order: "created_at" })}
    ${render_artists_list(updated, "Updated Artists", { is_active: true,  order: "updated_at" })}
    ${render_artists_list(deleted, "Deleted Artists", { is_active: false, order: "updated_at" })}
    `;
  }

  static render_table(artists) {
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
        ${artists.map(Artists.render_row).join("")}
      </tbody>
    </table>
    `;
  }

  static render_row(artist) {
    const other_names =
      (artist.other_names || "")
      .split(/\s+/)
      .sort()
      .map(name =>
        UI.linkTo(name, "/artists", { search: { name: name }}, "ex-artist-other-name")
      )
      .join(", ");

    const group_link = UI.linkTo(
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
	${other_names}
      </td>
      <td class="ex-artist-group-name">
	${artist.group_name ? group_link : ""}
      </td>
      <td class="ex-artist-status">
	${artist.is_banned ? "Banned" : ""}
	${artist.is_active ? ""       : "Deleted"}
      </td>
      <td class="ex-artist-created">
	${moment$1(artist.created_at).fromNow()}
      </td>
      <td class="ex-artist-updated">
	${moment$1(artist.updated_at).fromNow()}
      </td>
    </tr>
    `;
  }
}

class Comments {
  static initialize() {
    if ($("#c-comments").length || $("#c-posts #a-show").length) {
      $(function () {
        Comments.initialize_patches();
        Comments.initialize_metadata();
      });
    }

    if ($("#c-comments #a-index").length && window.location.search.match(/group_by=post/)) {
      Comments.initialize_tag_list();
    }
  }

  static initialize_patches() {
    // HACK: "Show all comments" replaces the comment list's HTML then
    // initializes all the reply/edit/vote links. We hook into that
    // initialization here so we can add in our own metadata at the same time.
    Danbooru.Comment.initialize_vote_links = function ($parent) {
      $parent = $parent || $(document);
      $parent.find(".unvote-comment-link").hide();

      Comments.initialize_metadata($parent);
    };
  }

  /*
   * Add 'comment #1234' permalink.
   * Add comment scores.
   */
  static initialize_metadata($parent) {
    $parent = $parent || $(document);

    $parent.find('.comment').each((i, e) => {
      const $menu = $(e).find('menu');

      const post_id = $(e).data('post-id');
      const comment_id = $(e).data('comment-id');
      const comment_score = $(e).data('score');

      const $upvote_link = $menu.find(`#comment-vote-up-link-for-${comment_id}`);
      const $downvote_link = $menu.find(`#comment-vote-down-link-for-${comment_id}`);

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

  // Sort tags by type, and put artist tags first.
  static initialize_tag_list() {
    const post_ids = $(".comments-for-post").map((i, e) => $(e).data('post-id')).toArray();

    $.getJSON(`/posts.json?tags=status:any+id:${post_ids.join(',')}`).then(posts => {
      $(".comments-for-post").each((i, comment) => {
        const post_id = $(comment).parent().data('id');
        const post = _.find(posts, { id: post_id });

        const $row = $(`<div class="row"></div>`);

        $row.append($(`
          <span class="info">
            <strong>Post</strong>
            <a href="/posts/${post.id}">#${post.id}</a>
          </span>
        `));

        $row.append($(`
          <span class="info">
            <strong>Size</strong>
            <a href="${post.file_url}">${filesize(post.file_size, { round: 0 })}</a>
            (${post.image_width}x${post.image_height})
          </span>
        `));

        $row.append($(`
          <span class="info">
            <strong>Favorites</strong>
            ${post.fav_count}
          </span>
        `));

        /*
        $row.append($(`
            <span class="info">
                <strong>Source</strong>
                <a href="${_.escape(post.source)}">${_.escape(post.source)}</a>
            </span>
        `));
        */

        $(comment).find('.header').prepend($row);

        const $tags =
          $(comment)
          .find(".category-0, .category-1, .category-3, .category-4")
          .detach();

        // Sort tags by category, but put general tags (category 0) at the end.
        const $sorted = _.sortBy($tags, t =>
          $(t).attr('class').replace(/category-0/, 'category-5')
        );

        $(comment).find('.list-of-tags').append($sorted);
      });
    });
  }
}

class ForumPosts {
  static initialize() {
    if ($("#c-forum-topics #a-show").length) {
        ForumPosts.initialize_permalinks();
    }
  }

  // On forum posts, change "Permalink" to "Forum #1234". */
  static initialize_permalinks() {
    $(".forum-post menu").each((i, e) => {
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

class Pools {
  static initialize() {
    if ($("#c-pools #a-show").length) {
      $(document).keydown("e", e => EX.UI.openEditPage('pools'));
    }
  }
}

class PostVersions {
  static initialize() {
    if ($("#c-post-versions #a-index").length && !UI.query("search[post_id]")) {
      PostVersions.initialize_thumbnails();
    }
  }

  // Show thumbnails instead of post IDs.
  static initialize_thumbnails() {
    let $post_column = $('tr td:nth-child(1)');
    let post_ids = $.map($post_column, e => $(e).text().match(/(\d+).\d+/)[1] );

    let post_data = [];
    let requests = _.chunk(post_ids, 100).map(function (ids) {
      let search = 'id:' + ids.join(',');

      return $.get(`/posts.json?tags=${search}`).then(data => {
        data.forEach((post, i) => post_data[post.id] = post);
      });
    });

    Promise.all(requests).then(_ => {
      $post_column.each((i, e) => {
        let post_id = $(e).text().match(/(\d+).\d+/)[1];
        $(e).html(Posts.preview(post_data[post_id]));
      });
    });
  }
}

var Post = Resource.Post = class Post extends Resource { };

var User = Resource.User = class User extends Resource {
  static get primaryKey() { return "id"; }
};

class Users {
  static initialize() {
    this.initializeWordBreaks();

    if ($$1("#c-users #a-show").length) {
      this.initializeExpandableGalleries();
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
    const ids = $users.map((i, e) => this.parseUserId($$1(e)));

    User.search(ids).then(users => {
      users = _$1.keyBy(users, "id");
      $users.each((i, e) => {
        const $user = $$1(e);
        const id = this.parseUserId($user);
        const user = users[id];

        _$1(user).forOwn((value, key) =>
          $user.attr(`data-${_$1(key).kebabCase()}`, value)
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

  static initializeExpandableGalleries() {
    // Rewrite /favorites link into ordfav: search so it's consistent with other post sections.
    $$1(".box a[href^='/favorites?user_id=']").attr(
      "href", `/posts?tags=ordfav:${encodeURIComponent(Danbooru.meta("current-user-name"))}`
    );

    $$1("#c-users #a-show > .box").each((i, e) => {
      const $gallery = $$1(e).addClass("ex-post-gallery");

      // Make gallery headers collapsible.
      const $toggleCollapse = $$1(`<a class="ui-icon ui-icon-triangle-1-s collapsible-header" href="#"></a>`);
      $gallery.find("h2").prepend($toggleCollapse);

      $toggleCollapse.click(event => {
        $$1(event.target).closest("h2").next("div").slideToggle();
        $$1(event.target).toggleClass('ui-icon-triangle-1-e ui-icon-triangle-1-s');
        return false;
      });

      // Store the tag search corresponding to this gallery section in a data
      // attribute for the click handler.
      const [match, tags] = $gallery.find('h2 a[href^="/posts"]').attr("href").match(/\/posts\?tags=(.*)/);
      $gallery.attr("data-tags", decodeURIComponent(tags));

      $gallery.find("div").append(`
        <article class="ex-text-post-preview">
          <a href="#">More »</a>
        </article>
      `);

      $gallery.find(".ex-text-post-preview a").click(event => {
        const $gallery = $$1(event.target).closest(".ex-post-gallery");

        const limit = 30;
        const page = Math.trunc($gallery.find(".post-preview").children().length / limit) + 1;

        Post.get({ tags: $gallery.data("tags"), page, limit }).then(posts => {
          const html = posts.map(Posts.preview).join("");

          // Hide the original posts to avoid appending duplicate posts.
          $gallery.find("div .post-preview:not(.ex-post-preview)").hide();

          // Append new posts, moving the "More »" link to the end.
          const $more = $gallery.find(".ex-text-post-preview").detach();
          $gallery.find("div").append(html, $more);

          $gallery.find(".ex-post-preview").trigger("ex.post-preview:create");
        });

        return false;
      });
    });
  }

  static userLinks() {
    return $$1('a[href^="/users/"]')
      .filter((i, e) => !$$1(e).text().match(/My Account|Profile/))
      .filter((i, e) => this.parseUserId($$1(e)));
  }

  static parseUserId($user) {
    return _$1.nth($user.attr("href").match(/^\/users\/(\d+)$/), 1);
  }
}

class WikiPages {
  static initialize() {
    if ($("#c-wiki-pages").length === 0) {
      return;
    }

    WikiPages.initialize_collapsible_headings();
    WikiPages.initialize_table_of_contents();
  }

  // Add collapse/expand button to headings.
  static initialize_collapsible_headings() {
    const $headings = $("#wiki-page-body").find('h1,h2,h3,h4,h5,h6');

    if ($headings.length < 3) {
      return;
    }

    $headings.prepend(
      $('<a class="ui-icon ui-icon-triangle-1-s collapsible-header"></a>')
    ).click(e => {
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
  static initialize_table_of_contents() {
    const $headings = $("#wiki-page-body").find('h1,h2,h3,h4,h5,h6');

    const hasToC =
      $("div.expandable-header > span")
      .filter((i, e) =>
        $(e).text().match(/table of contents/i)
      ).length > 0;

    if ($headings.length < 3 || hasToC) {
      return;
    }

    const $toc =
      DText.create_expandable(
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

      const next_level = parseInt(e.tagName[1]);
      if (next_level > level) {
        $submenu = $('<ul></ul>');
        $menu.append($submenu);
        $menu = $submenu;
      } else if (next_level < level) {
        $menu = $menu.parent();
      }

      $(e).attr('id', anchor);
      $menu.append($(
        `<li><a href="#${anchor}">${header}</a></li>`
      ));

      level = next_level;
    });
  }
}

class UI {
  static initialize() {
    UI.initialize_footer();
    UI.initialize_moment();
    UI.initialize_patches();

    EX.config.showThumbnailPreviews && UI.initialize_post_thumbnail_previews();
    EX.config.showPostLinkPreviews && UI.initialize_post_link_previews();
    EX.config.styleWikiLinks && UI.initialize_wiki_links();
    EX.config.useRelativeTimestamps && UI.initialize_relative_times();
    EX.config.resizeableSidebars && UI.initialize_resizeable_sidebar();
    EX.config.enableHotkeys && UI.initialize_hotkeys();
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

  // Show post previews when hovering over post #1234 links.
  static initialize_post_link_previews() {
    $('a[href^="/posts/"]')
      .filter((i, e) => /post #\d+/.test($(e).text()))
      .addClass('ex-thumbnail-tooltip-link');

    UI.install_tooltips($(".ex-thumbnail-tooltip-link"));
  }

  // Show post previews when hovering over thumbnails.
  static initialize_post_thumbnail_previews() {
    // The thumbnail container is .post-preview on every page but comments and
    // the mod queue. Handle those specially.
    if ($("#c-comments").length) {
      $("#c-comments .post-preview .preview img").addClass('ex-thumbnail-tooltip-link');
    } else if ($("#c-post-moderator-queues").length) {
      $("#c-post-moderator-queues .mod-queue-preview aside img").addClass('ex-thumbnail-tooltip-link');
    } else {
      $(".post-preview img").addClass('ex-thumbnail-tooltip-link');
    }

    $(document).on("ex.post-preview:create", event => {
      const $post = $(event.target).find("img").addClass('ex-thumbnail-tooltip-link');
      UI.install_tooltips($post);
      return false;
    });

    UI.install_tooltips($(".ex-thumbnail-tooltip-link"));
  }

  static install_tooltips($target) {
    const max_size = 450;

    $target.tooltip({
      items: "*",
      content: `<div style="width: ${max_size}px; height: ${max_size}px"></div>`,
      show: { delay: EX.config.thumbnailPreviewDelay },
      position: {
        my: "left+10 top",
        at: "right top",
      },
      open: (e, ui) => {
        try {
          // XXX should instead disable thumbnails when preview panel is open.
          if (ModeMenu.getMode() === "preview" || ModeMenu.getMode() === "tag-script") {
            $(ui.tooltip).css({ visibility: "hidden" });
            return;
          }

          let $e = $(e.target);
          let $link = $e;

          // XXX hack
          if ($e.prop("nodeName") === "IMG") {
            $link = $e.closest("a");
          }

          const id = $link.attr('href').match(/\/posts\/(\d+)/)[1];

          // XXX avoid lookup on tooltip open.
          $.getJSON(`/posts/${id}.json`).then(post =>
            $(ui.tooltip).html(Posts.preview(post, { size: "large", classes: [ "ex-thumbnail-tooltip" ]}))
          );
        } catch (e) {
          console.log(e);
        }
      }
    });
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
      _$1($wiki_links.toArray())
      .map(parse_tag_name)
      .reject(tag => tag.match(meta_wikis))
      .value();

    // Fetch tag data for each batch of tags, then categorize them and add tooltips.
    Tag.search(tags).then(tags => {
      tags = _$1.keyBy(tags, "name");
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

        _$1(tag).forOwn((value, key) =>
          $wiki_link.attr(`data-tag-${_$1(key).kebabCase()}`, value)
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

  static initialize_resizeable_sidebar() {
    let $sidebar = $("#sidebar");

    if ($sidebar.length === 0) {
      return;
    }

    const width = _$1.defaultTo(EX.config.sidebarState[EX.config.pageKey()], EX.config.defaultSidebarWidth);
    $sidebar.toggle(width > 0);

    $sidebar.addClass("ex-panel").width(width).after(`
      <section id="ex-sidebar-resizer" class="ex-vertical-resizer"></section>
    `);

    // XXX fix magic numbers (28 = 2em).
    const drag = function (e, ui) {
      $sidebar.width(Math.max(0, ui.position.left - 28));
      $sidebar.toggle($sidebar.width() > 0);
    };

    const stop = function (e, ui) {
      let state = EX.config.sidebarState;
      state[EX.config.pageKey()] = Math.max(0, ui.position.left - 28);
      EX.config.sidebarState = state;
    };

    $("#ex-sidebar-resizer").draggable({
      axis: "x",
      helper: "clone",
      drag: _$1.throttle(drag, 16),
      stop: _$1.debounce(stop, 100),
    });
  }

  // Global keybindings.
  // - Escape: Close notice popups.
  // - W: Smooth scroll up.
  // - S: Smooth scroll down.
  // - Ctrl+Enter: Submit form.
  static initialize_hotkeys() {
    // Escape: Close notice popups.
    $(document).keydown('esc', e => $('#close-notice-link').click());

    // Escape: Unfocus text entry field.
    $('#tag-script-field').attr('type', 'text');
    $('input[type=text],textarea').keydown('esc', e => $(e.target).blur());

    UI.initialize_scroll_hotkeys();

    if ($(".paginator").length) {
      UI.initialize_paginator_hotkeys();
    }

    $(".dtext-previewable textarea").keydown("ctrl+return", e => {
      $(e.target).closest("form").find('input[type="submit"][value="Submit"]').click();
      e.preventDefault();
    });
  }

  static initialize_scroll_hotkeys() {
    let scroll = (direction, duration, distance) =>
      _$1.throttle(() => {
        const top = $(window).scrollTop() + direction * $(window).height() * distance;
        $('html, body').animate({scrollTop: top}, duration, "linear");
      }, duration);
    /*
    Danbooru.Shortcuts.nav_scroll_down =
        () => Danbooru.scroll_to($(window).scrollTop() + $(window).height() * 0.15);
    Danbooru.Shortcuts.nav_scroll_up =
        () => Danbooru.scroll_to($(window).scrollTop() - $(window).height() * 0.15);
    */

    // Enable smooth scrolling with W/S keys.
    Danbooru.Shortcuts.nav_scroll_down = scroll(+1, 50, 0.06);
    Danbooru.Shortcuts.nav_scroll_up   = scroll(-1, 50, 0.06);
  }

  /*
   * Shift+1..9: Jump to page N.
   * Shift+0: Jump to last page.
   */
  static initialize_paginator_hotkeys() {
    // Add paginator above results.
    // $('.paginator').clone().insertBefore('#post-sections');

    /* Shift+1..9: Jump to page N. */
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n =>
      $(document).keydown(`shift+${n}`, e => {
        UI.gotoPage(n);
        e.preventDefault();
      })
    );

    // Shift+0: Switch to last page if there is one.
    $(document).keydown(`shift+0`, e => {
      e.preventDefault();

      // a:not(a[rel]) - exclude the Previous/Next links seen in the paginator on /favorites et al.
      const last_page = $('div.paginator li:nth-last-child(2) a:not(a[rel])').first().text();

      if (last_page) {
        UI.gotoPage(last_page);
      }
    });
  }

  static linkTo(name, path = "/", params = {}, ...classes) {
    const query = $.param(params);
    const href = (query === "")
               ? path
               : path + "?" + query;

    return `<a class="${_$1.escape(classes.join(" "))}" href="${href}">${_$1.escape(name)}</a>`;
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

  // Go to page N.
  static gotoPage(n) {
    if (location.search.match(/page=(\d+)/)) {
      location.search = location.search.replace(/page=(\d+)/, `page=${n}`);
    } else {
      location.search += `&page=${n}`;
    }
  }
}

UI.Header = Header;
UI.ModeMenu = ModeMenu;
UI.Notes = Notes;
UI.PreviewPanel = PreviewPanel;

UI.Artists = Artists;
UI.Comments = Comments;
UI.ForumPosts = ForumPosts;
UI.Pools = Pools;
UI.Posts = Posts;
UI.PostVersions = PostVersions;
UI.Users = Users;
UI.WikiPages = WikiPages;

___$insertStyle("@import url(https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css);\n/* /posts/1234 */\n/* Move artist tags to top of the tag list. */\n#tag-list {\n  /*\n     * Break tags that are too long for the tag list (e.g.\n     * kuouzumiaiginsusutakeizumonokamimeichoujin_mika)\n     */\n  word-break: break-word;\n  display: flex;\n  flex-direction: column;\n  /* Move artist tags to top of tag list. */ }\n  #tag-list .ex-artist-tag-list-header,\n  #tag-list .ex-artist-tag-list {\n    order: -1; }\n  #tag-list .ex-tag-list-header h1, #tag-list .ex-tag-list-header h2 {\n    display: inline-block; }\n  #tag-list .ex-tag-list-header .post-count {\n    margin-left: 0.5em; }\n\n/*\n * Make the parent/child thumbnail container scroll vertically, not horizontally, to prevent\n * long child lists from blowing out the page width.\n */\n#has-parent-relationship-preview,\n#has-children-relationship-preview {\n  overflow: auto;\n  white-space: initial; }\n\n/* Fit posts to screen width. */\n#image {\n  max-width: 100%;\n  height: auto !important; }\n\n.ex-post-gallery span h2 {\n  display: inline-block; }\n\n.ex-text-post-preview {\n  display: inline-block;\n  float: left;\n  height: 154px;\n  width: 154px;\n  margin: 0 10px 10px 0;\n  text-align: center;\n  background: #EEEEEE;\n  border: 2px solid #DDDDDD; }\n  .ex-text-post-preview a {\n    display: inline-block;\n    width: 100%;\n    height: 100%;\n    line-height: 154px; }\n\n.ex-vertical-resizer {\n  cursor: col-resize;\n  width: 1px;\n  border: 0.5em solid white;\n  background: #f2f2f2;\n  transition: background 0.125s; }\n\n.ex-vertical-resizer:hover {\n  background: #cccccc;\n  transition: background 0.125s; }\n\n.ex-panel {\n  overflow: hidden; }\n\n.ex-preview-panel-container {\n  display: flex;\n  min-height: 100vh; }\n\n#ex-preview-panel {\n  width: 0;\n  overflow: hidden; }\n\n#ex-preview-panel > div {\n  display: flex;\n  overflow-y: auto; }\n\n#ex-preview-panel > div > article {\n  width: auto;\n  height: auto;\n  margin: auto; }\n\n#ex-preview-panel > div > article.post-preview .post-media {\n  max-width: 100%;\n  max-height: 100%;\n  box-sizing: border-box; }\n\n#ex-preview-panel .ex-fixed {\n  position: fixed; }\n\n.ex-content-panel {\n  flex: 1;\n  margin-left: 0px !important; }\n\n#ex-header {\n  display: flex;\n  position: absolute;\n  top: 0;\n  padding-top: 5px;\n  width: 100%;\n  z-index: 100;\n  background: white;\n  border-bottom: 1px solid #EEE; }\n\n#ex-header.ex-fixed {\n  position: fixed; }\n\n#ex-header h1 {\n  display: inline-block;\n  font-size: 2.5em;\n  margin: 0 30px; }\n\n#ex-header .ex-search-box {\n  margin: auto;\n  display: flex;\n  flex: 0 1 30%; }\n\n#ex-header .ex-search-box input[name=\"tags\"] {\n  flex: 0 1 100%; }\n\n#ex-header .ex-search-box input[type=\"submit\"] {\n  flex: 1;\n  margin: auto 1em; }\n\n#ex-header .ex-mode-menu {\n  margin: auto;\n  flex: 1 2 70%; }\n\n#ex-header .ex-mode-menu .ex-tag-script-controls {\n  display: inline-block;\n  margin: auto; }\n\n#ex-header .ex-mode-menu label {\n  font-weight: bold;\n  cursor: auto; }\n\n#ex-header .ex-header-close {\n  margin: auto;\n  margin-right: 30px;\n  color: #0073ff;\n  cursor: pointer; }\n\n/* http://fontawesome.io/icon/times-circle/ */\n#ex-header.ex-fixed .ex-header-close .fa::before {\n  content: \"\\f057\"; }\n\n/* http://fontawesome.io/icon/thumb-tack/ */\n#ex-header.ex-static .ex-header-close .fa::before {\n  content: \"\\f08d\"; }\n\n@media (max-width: 1280px) {\n  #ex-header h1,\n  header#top h1 {\n    font-size: 1.5em; }\n  #ex-header .ex-mode-menu label {\n    display: none; } }\n\n/* Overrides for Danbooru's responsive layout */\n@media screen and (max-width: 660px) {\n  body {\n    overflow-x: hidden; }\n  #ex-header input {\n    font-size: 1em; }\n  #ex-header {\n    text-align: initial;\n    line-height: initial; }\n  #nav {\n    display: block;\n    float: none;\n    font-size: 1em; }\n  header#top menu {\n    width: initial; }\n  header#top menu li a {\n    padding: 6px 5px; }\n  .ex-preview-panel-container {\n    display: block;\n    min-height: initial; }\n  #sidebar,\n  #ex-sidebar-resizer,\n  #ex-preview-panel-resizer,\n  #ex-preview-panel {\n    display: none !important; } }\n\n#notice {\n  top: 4.5em !important; }\n\n.ex-artists {\n  white-space: nowrap; }\n\n.ex-artist .ex-artist-id {\n  width: 10%; }\n\n.ex-artist .ex-artist-other-names {\n  width: 100%;\n  white-space: normal; }\n\n#c-artists #sidebar label {\n  display: block;\n  font-weight: bold;\n  padding: 4px 0 4px 0;\n  width: auto;\n  cursor: auto; }\n\n#c-artists #sidebar input[type=\"text\"] {\n  width: 100% !important; }\n\n#c-artists #sidebar button[type=\"submit\"] {\n  display: block;\n  margin: 4px 0 4px 0; }\n\n#c-artists #sidebar h2 {\n  font-size: 1em;\n  display: inline-block;\n  margin: 0.75em 0 0.25em 0; }\n\n#c-artists #a-index {\n  opacity: 0; }\n\n.ex-index {\n  opacity: 1 !important;\n  transition: opacity 0.15s; }\n\n#c-users #a-edit #ex-settings-section label {\n  display: inline-block; }\n\n#wiki-page-body h1, #wiki-page-body h2, #wiki-page-body h3,\n#wiki-page-body h4, #wiki-page-body h5, #wiki-page-body h6 {\n  /* display: flex; */\n  /* align-items: center; */\n  padding-top: 52px;\n  margin-top: -52px; }\n\nbody.mode-tag-script {\n  background-color: white; }\n\nbody.mode-tag-script #ex-header {\n  border-top: 2px solid #D6D; }\n\nbody.mode-preview #ex-header {\n  border-top: 2px solid #0073ff; }\n\nbody.mode-view #ex-preview-panel-resizer {\n  display: none; }\n\n/* Highlight thumbnails in grey when hovering in preview or tag script mode. */\nbody.mode-preview article.post-preview:hover,\nbody.mode-preview #c-moderator-post-queues .post-preview aside:hover,\nbody.mode-preview #c-comments .post-preview .preview:hover,\nbody.mode-tag-script article.post-preview:hover,\nbody.mode-tag-script #c-moderator-post-queues .post-preview aside:hover,\nbody.mode-tag-script #c-comments .post-preview .preview:hover {\n  background: #EEEEEE; }\n\nbody.mode-tag-script article.post-preview.ui-selected,\nbody.mode-tag-script #c-moderator-post-queues .post-preview aside.ui-selected,\nbody.mode-tag-script #c-comments .post-preview .preview.ui-selected {\n  background: lightblue; }\n\nbody.mode-tag-script article.post-preview.ui-selected {\n  padding: 0 10px 10px 0;\n  margin: 0; }\n\n.ui-selectable {\n  -ms-touch-action: none;\n  touch-action: none; }\n\n.ui-selectable-helper {\n  position: absolute;\n  z-index: 100;\n  border: 1px dotted black; }\n\n.ui-tooltip {\n  padding: 8px;\n  position: absolute;\n  z-index: 9999;\n  max-width: 300px;\n  -webkit-box-shadow: 0 0 5px #aaa;\n  box-shadow: 0 0 5px #aaa; }\n\n.ui-tooltip {\n  max-width: 450px !important;\n  max-height: 450px !important;\n  border-width: 2px; }\n\n.ui-tooltip .ex-thumbnail-tooltip .post-media {\n  max-width: 450px;\n  max-height: 450px;\n  height: auto;\n  box-sizing: border-box; }\n\n.ui-tooltip .post-preview {\n  width: auto;\n  height: auto;\n  margin: 0; }\n\na.ui-icon.collapsible-header {\n  display: inline-block;\n  margin-left: -8px; }\n\n.ex-short-relative-time {\n  color: #CCC;\n  margin-left: 0.2em; }\n\n.tag-post-count-empty {\n  border-bottom: 1px dotted; }\n\n.tag-dne {\n  border-bottom: 1px dotted; }\n\n/* Ensure colorized tags are still hidden. */\n.spoiler:hover a.tag-type-1 {\n  color: #A00; }\n\n.spoiler:hover a.tag-type-3 {\n  color: #A0A; }\n\n.spoiler:hover a.tag-type-4 {\n  color: #0A0; }\n\n.spoiler:not(:hover) a {\n  color: black !important; }\n");

window.moment = moment$1;

var ex = window.EX = class EX {
  static get Config() { return Config; }
  static get DText() { return DText; }
  static get Resource() { return Resource; }
  static get UI() { return UI; }

  static initialize() {
    console.timeEnd("preinit");

    console.groupCollapsed("settings");
    EX.config = new EX.Config();

    EX.config.enableHeader && UI.Header.initialize();
    EX.UI.initialize();
    EX.config.enableNotesLivePreview && EX.UI.Notes.initialize();
    EX.config.usernameTooltips && EX.UI.Users.initializeUserLinks();

    EX.config.artistsRedesign && EX.UI.Artists.initialize();
    EX.config.commentsRedesign && EX.UI.Comments.initialize();
    EX.config.forumRedesign && EX.UI.ForumPosts.initialize();
    EX.config.poolsRedesign && EX.UI.Pools.initialize();
    EX.config.postsRedesign && EX.UI.Posts.initialize();
    EX.config.postVersionsRedesign && EX.UI.PostVersions.initialize();
    EX.config.wikiRedesign && EX.UI.WikiPages.initialize();
    EX.config.usersRedesign && EX.UI.Users.initialize();

    console.groupEnd("settings");
    console.timeEnd("initialized");
  }
};

console.log("Danbooru:", window.Danbooru);
console.log("EX:", EX);

console.timeEnd("loaded");
$(function () {
  try {
    EX.initialize();
  } catch(e) {
    console.trace(e);
    $("footer").append(`<div class="ex-error">Danbooru EX error: ${e}</div>`);
    throw e;
  }
});

return ex;

}(jQuery,moment,_,filesize));
