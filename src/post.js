import Resource from "./resource.js";

export default Resource.Post = class Post extends Resource {
  static get primaryKey() { return "post"; }
}
