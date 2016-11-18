import _ from "lodash";
import $ from "jquery";

import EX from "../ex.js";

export default class Sidebar {
  static initialize() {
    let $sidebar = Sidebar.$panel;

    if ($sidebar.length === 0) {
      return;
    }
    
    $sidebar.parent().addClass("ex-panel-container");
    $sidebar.addClass("ex-panel")

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
