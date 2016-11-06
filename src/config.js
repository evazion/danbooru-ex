import _ from "lodash";

export default class Config {
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
        value: true,
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
        value: _.fill(Array(10), ""),
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
    const value = JSON.parse(_.defaultTo(
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
    return _.mapValues(Config.Defaults, (v, k) => this.get(k));
  }

  reset() {
    _(Config.Defaults).keys().each(key => {
      delete this.storage["EX.config." + key]
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
      _(Config.Defaults)
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
for (const key of _.keys(Config.Defaults)) {
  Object.defineProperty(Config.prototype, key, {
    get: function ()  { return this.get(key) },
    set: function (v) { return this.set(key, v) },
    enumerable: true,
    configurable: true,
  });
}
