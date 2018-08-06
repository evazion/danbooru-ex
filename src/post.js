import _ from "lodash";
import Resource from "./resource.js";

export default Resource.Post = class Post extends Resource {
  static get primaryKey() { return "post"; }

  static tags(post) {
    return _.concat(
      post.tag_string_artist.split(/\s+/).map(name => ({ name, category: 1 })),
      post.tag_string_copyright.split(/\s+/).map(name => ({ name, category: 3 })),
      post.tag_string_character.split(/\s+/).map(name => ({ name, category: 4 })),
      post.tag_string_meta.split(/\s+/).map(name => ({ name, category: 5 })),
      post.tag_string_general.split(/\s+/).map(name => ({ name, category: 0 }))
    );
  }

  static update(postId, tags) {
    return this.put(postId, { "post[old_tag_string]": "", "post[tag_string]": tags });
  }

  get source_domain() {
    try {
      return new URL(this.source).hostname;
    } catch (_e) {
      return "";
    }
  }

  get pretty_rating() {
    switch (this.rating) {
      case "s": return "safe";
      case "q": return "questionable";
      case "e": return "explicit";
    }
  }
}
