export default class Pools {
  static initialize() {
    if ($("#c-pools #a-show").length) {
      $(document).keydown("e", e => EX.UI.openEditPage('pools'));
    }
  }
}
