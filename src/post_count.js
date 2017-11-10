import Resource from "./resource.js";

export default Resource.PostCount = class PostCount extends Resource {
  static get primaryKey() { return "id"; }
  static get controller() { return "/counts/posts"; }

  static count(query) {
    return PostCount.index({ tags: query }).then(response => response.counts.posts);
  }
}
