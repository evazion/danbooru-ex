import _ from "lodash";

export class Setting {
  constructor({ value, help, configurable, storage } = {}) {
    this.value = value;
    this.help = help;
    this.configurable = configurable;
    this.storage = storage;
  }

  static Session({ value } = {}) {
    return new Setting({ value, help: "none", configurable: false, storage: window.sessionStorage });
  }

  static Shared({ value = true, help } = {}) {
    return new Setting({ value, help, configurable: true, storage: window.localStorage });
  }
}

export default class Config {
  static get Items() {
    return {
      schemaVersion: Setting.Shared({
        configurable: false,
        value: 1
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
      enableHotkeys: Setting.Shared({
        help: "Enable additional keyboard shortcuts.",
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
      forumRedesign: Setting.Shared({
        help: 'Replace Permalinks on forum posts with "forum #1234" links',
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
        value: 480
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
      headerState: Setting.Session({
        value: "ex-fixed"
      }),
    };
  }

  constructor() {
    if ($("#c-users #a-edit").length) {
      this.initializeForm();
    }
  }

  get(key) {
    const item = Config.Items[key];
    const value = JSON.parse(_.defaultTo(
      item.storage["EX.config." + key],
      JSON.stringify(item.value)
    ));

    console.log(`[CFG] READ EX.config.${key}:`, value);
    return value;
  }

  set(key, value) {
    const item = Config.Items[key];
    item.storage["EX.config." + key] = JSON.stringify(value);
    console.log(`[CFG] SAVE EX.config.${key} =`, value);
    return this;
  }

  get all() {
    return _.mapValues(Config.Items, (v, k) => this.get(k));
  }

  reset() {
    _(Config.Items).each((item, key) => {
      delete item.storage["EX.config." + key]
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
      Danbooru.notice("Setting saved.");
    });

    $("#factory_reset").click(e => {
      confirm('Reset Danbooru EX settings?') && this.reset() && Danbooru.notice("Danbooru EX reset.");
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
