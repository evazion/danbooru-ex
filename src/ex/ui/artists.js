export default class Artists {
  static initialize() {
    if ($("#c-artists #a-show").length) {
      $(document).keydown("e", e => EX.UI.openEditPage('artists'));
    }
  }
}
