export default class Sidebar {
  static initialize() {
    let $sidebar = $("#sidebar");

    if ($sidebar.length === 0) {
      return;
    }
    
    $sidebar.parent().addClass("ex-panel-container");

    const width = _.defaultTo(EX.config.sidebarState[EX.config.pageKey()], EX.config.defaultSidebarWidth);
    $sidebar.toggle(width > 0);

    $sidebar.addClass("ex-panel").css({ flex: `0 0 ${width}px` });
    $sidebar.after(`
      <div id="ex-sidebar-resizer" class="ex-vertical-resizer"></div>
    `);

    // XXX fix magic numbers (28 = 2em).
    const drag = function (e, ui) {
      const width = Math.max(0, ui.position.left - 28);
      $sidebar.css({ flex: `0 0 ${width}px` });
      $sidebar.toggle($sidebar.width() > 0);
    }

    const stop = function (e, ui) {
      let state = EX.config.sidebarState;
      state[EX.config.pageKey()] = Math.max(0, ui.position.left - 28);
      EX.config.sidebarState = state;
    };

    $("#ex-sidebar-resizer").draggable({
      axis: "x",
      helper: "clone",
      drag: _.throttle(drag, 16),
      stop: _.debounce(stop, 100),
    });
  }
}
