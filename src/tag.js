import _ from "lodash";
import Resource from "./resource.js";

export default Resource.Tag = class Tag extends Resource {
  static get Categories() {
    return [
      "General",    // 0
      "Artist",     // 1
      undefined,    // 2 (unused)
      "Copyright",  // 3
      "Character"   // 4
    ];
  }

  static get searchParams() {
    return _.merge({}, super.searchParams, { search: { hide_empty: "no" }});
  }

  static get primaryKey() { return "name"; }
}
