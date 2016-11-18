import EX from "../ex.js";

export default class Pools {
  static initialize() {
    if ($("#c-pools #a-show").length) {
      $(document).keydown("e", () => EX.UI.openEditPage('pools'));
    }
  }
}
