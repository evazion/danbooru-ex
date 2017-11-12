import _ from "lodash";
import Resource from "./resource.js";

export default Resource.Post = class Post extends Resource {
  static get primaryKey() { return "post"; }

  static tags(post) {
    return _.concat(
      post.tag_string_artist.split(/\s+/).map(name => ({ name, category: 1 })),
      post.tag_string_copyright.split(/\s+/).map(name => ({ name, category: 3 })),
      post.tag_string_character.split(/\s+/).map(name => ({ name, category: 4 })),
      post.tag_string_general.split(/\s+/).map(name => ({ name, category: 0 }))
    );
  }

  static update(postId, tags) {
    return this.put(postId, { "post[old_tag_string]": "", "post[tag_string]": tags });
  }
}
