export default class Keys {
  static initialize() {
    const keypress = new window.keypress.Listener();

    keypress.simple_combo("q", () => $("#ex-header").trigger("ex.header-focus-search"));
    keypress.simple_combo("meta enter", () => $("#ex-header").trigger("ex.header-execute-search-in-new-tab"));
  }
}
