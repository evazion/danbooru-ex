import _ from "lodash";

export default class Navigation {
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

  static goTop()    { window.scrollTo(0, 0); }
  static goBottom() { window.scrollTo(0, $(document).height()); }
  static goForward() { window.history.forward(); }
  static goBack()    { window.history.back(); }

  static scroll(direction, duration, distance) {
    return _.throttle(() => {
      const top = $(window).scrollTop() + direction * $(window).height() * distance;
      $('html, body').animate({scrollTop: top}, duration, "linear");
    }, duration);
  }
}
