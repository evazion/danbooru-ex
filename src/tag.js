import _ from "lodash";
import Resource from "./resource.js";
import Post from "./post.js";

export default Resource.Tag = class Tag extends Resource {
  static get Categories() {
    return [
      "General",    // 0
      "Artist",     // 1
      undefined,    // 2 (unused)
      "Copyright",  // 3
      "Character",  // 4
      "Meta"        // 5
    ];
  }

  static get searchParams() {
    return _.merge({}, super.searchParams, { search: { hide_empty: "no" }});
  }

  static get primaryKey() { return "name"; }

  static renderTag(tag) {
    const href = `/posts?tags=${encodeURIComponent(tag.name)}`;
    return `<a class="search-tag tag-type-${tag.category}" href="${href}">${_.escape(tag.name)}</a>`;
  }

  static renderTagList(post, classes) {
    const tags = Post.tags(post);
    return `
      <section class="ex-tag-list ${classes}">
        <h1>Tags</h1>
        <ul>${tags.map(Tag.renderTagListItem).join("")}</ul>
      </section>
    `;
  }

  static renderTagListItem(tag) {
    return `<li class="category-${tag.category}">${Tag.renderTag(tag)}</li>`;
  }

  static renderSearchTagListItem(tag) {
    return `
      <li class="category-${tag.category}">
        <a class="wiki-link" href="/wiki_pages/show_or_new?title=${encodeURIComponent(tag.name)}">?</a>
        ${Tag.renderTag(tag)}
        <span class="post-count">${tag.post_count}</span>
      </li>
    `;
  }
}
