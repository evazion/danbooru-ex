export default class PreviewPanel {
  static initialize() {
    // This is the main content panel that comes before the preview panel.
    let $content = $(`
      #c-posts #content,
      #c-notes #a-index,
      #c-pools #a-gallery,
      #c-pools #a-show,
      #c-comments #a-index,
      #c-moderator-post-queues #a-show
    `);

    if ($content.length === 0) {
      return;
    }

    $content.parent().css({ display: "flex" });
    $content.addClass("ex-content-panel");
    $content.after(`
      <section id="ex-preview-panel-resizer" class="ex-vertical-resizer">
        <div class="ex-vertical-resizer-line"></div>
      </section>
      <section id="ex-preview-panel" class="ex-panel">
        <div>
          <article>
            No image selected. Click a thumbnail to open image preview.
          </article>
        </div>
      </section>
    `);

    // XXX DRY
    let controller = $("#page > div:nth-child(2)").attr("id");
    let action     = $("#page > div:nth-child(2) > div").attr("id");
    const width = EX.config.previewPanelState[`${controller} ${action}`] || 0;
    $("#ex-preview-panel").width(width);

    const origTop = $("#ex-preview-panel > div").offset().top;
    const headerHeight = $("#ex-header").outerHeight(true);
    const footerHeight = $("footer").outerHeight(true);

    // XXX set height on initialization as well as scroll.
    const onScroll = function (event) {
      let height;

      if (window.scrollY + headerHeight >= origTop) {
        $("#ex-preview-panel > div").addClass("ex-fixed").css({ top: headerHeight });
        height = `calc(100vh - ${headerHeight}px - 1em)`;
      } else {
        $("#ex-preview-panel > div").removeClass("ex-fixed");
        height = `calc(100vh - ${origTop - window.scrollY}px - 1em)`;
      }

      if (window.scrollY + footerHeight >= $("body").height() - window.innerHeight) {
        const diff = window.scrollY + footerHeight - $("body").height() + window.innerHeight;
        height = `calc(100vh - ${headerHeight}px - ${diff}px)`;
      }

      $("#ex-preview-panel > div").css({ height });
      $("#ex-preview-panel > div > article.post-preview img").css({ "max-height": height });
    };
    $(document).scroll(_.throttle(onScroll, 16));

    const resizeDrag = function (e, ui) {
      // XXX magic number
      const width = $("body").innerWidth() - ui.position.left - 28;

      $("#ex-preview-panel").width(width);
      $("#ex-preview-panel > div").width(width);
    };

    const resizeStop = function (e, ui) {
      let state = EX.config.previewPanelState;
      state[`${controller} ${action}`] = $("#ex-preview-panel").width();
      EX.config.previewPanelState = state;
    };

    $("#ex-preview-panel-resizer").draggable({
      axis: "x",
      helper: "clone",
      drag: _.throttle(resizeDrag, 16),
      stop: _.debounce(resizeStop, 100),
    });
  }
}
