import Resource from "./resource.js";

export default Resource.Artist = class Artist extends Resource {
  static get primaryKey() { return "id"; }
}
