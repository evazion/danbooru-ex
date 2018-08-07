import _ from "lodash";
import Resource from "./resource.js";

export default Resource.Post = class Post extends Resource {
  static get primaryKey() { return "post"; }

  get tags() {
    let split_tag_string = (tag_string, category) => {
      return tag_string.split(/\s+/).filter(String).map(name => ({ name, category }));
    }

    return _.concat(
      split_tag_string(this.tag_string_artist, 1),
      split_tag_string(this.tag_string_copyright, 3),
      split_tag_string(this.tag_string_character, 4),
      split_tag_string(this.tag_string_meta, 5),
      split_tag_string(this.tag_string_general, 0),
    );
  }

  static update(postId, tags) {
    return this.put(postId, { "post[old_tag_string]": "", "post[tag_string]": tags });
  }

  get source_domain() {
    try {
      const hostname = new URL(this.source).hostname;
      const domain = hostname.match(/([^.]*)\.([^.]*)$/)[0];
      return domain;
    } catch (_e) {
      return "";
    }
  }

  get source_link() {
    const maxLength = 10;
    const truncatedSource = this.source.replace(new RegExp(`(.{${maxLength}}).*$`), "$1...");

    if (this.source.match(/^https?:\/\//)) {
      return `<a href="${_.escape(this.source)}">${this.source_domain}</a>`;
    } else if (this.source.trim() !== "") {
      return `<i>${_.escape(truncatedSource)}</i>`;
    } else {
      return "<i>none</i>";
    }
  }

  get pretty_rating() {
    switch (this.rating) {
      case "s": return "Safe";
      case "q": return "Questionable";
      case "e": return "Explicit";
    }
  }
}
