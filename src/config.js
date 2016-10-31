import _ from "lodash";

export default class Config {
  static get Defaults() {
    return {
      schemaVersion: 1,
      showHeaderBar: true,
      showThumbnailPreviews: true,
      showPostLinkPreviews: true,
      styleUsernames: true,
      styleWikiLinks: true,
      useRelativeTimestamps: true,
      resizeableSidebars: true,
      postSidebarWidth: "15em",
      previewPanel: true,
    };
  }

  constructor() {
    this.storage = window.localStorage;
  }

  get(key) {
    const value = this.storage["EX.config." + key]

    return (value === undefined) ? Config.Defaults[key] : JSON.parse(value);
  }

  set(key, value) {
    this.storage["EX.config." + key] = value;
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

  get schemaVersion() { return this.get("schemaVersion"); }
  get showHeaderBar() { return this.get("showHeaderBar"); }
  get showThumbnailPreviews() { return this.get("showThumbnailPreviews"); }
  get showPostLinkPreviews() { return this.get("showPostLinkPreviews"); }
  get styleUsernames() { return this.get("styleUsernames"); }
  get styleWikiLinks() { return this.get("styleWikiLinks"); }
  get resizeableSidebars() { return this.get("resizeableSidebars"); }
  get postSidebarWidth() { return this.get("postSidebarWidth"); }
  get previewPanel() { return this.get("previewPanel"); }

  set schemaVersion(v) { return this.set("schemaVersion", v); }
  set showHeaderBar(v) { return this.set("showHeaderBar", v); }
  set showThumbnailPreviews(v) { return this.set("showThumbnailPreviews", v); }
  set showPostLinkPreviews(v) { return this.set("showPostLinkPreviews", v); }
  set styleUsernames(v) { return this.set("styleUsernames", v); }
  set useRelativeTimestamps(v) { return this.set("useRelativeTimestamps", v); }
  set resizeableSidebars(v) { return this.set("resizeableSidebars", v); }
  set postSidebarWidth(v) { return this.set("postSidebarWidth", v); }
  set previewPanel(v) { return this.set("previewPanel", v); }

  // Define getters/setters for `Config.showHeaderBar` et al.
  /*
  for (const key of _.keys(Config.Defaults)) {
    Object.defineProperty(Config.prototype, key, {
      get: ()  => function ()  { return this.get(key) },
      set: (v) => function (v) { return this.set(key, v) },
      enumerable: true,
      configurable: true,
    });
  }
  */
}
