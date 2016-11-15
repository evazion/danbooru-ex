import UI from "../ui.js";
import Artist from "../artist.js";
import Tag from "../tag.js";

import moment from "moment";

export default class Artists {
  static initialize() {
    if ($("#c-artists #a-show").length) {
      Artists.initialize_hotkeys();
    }

    if ($("#c-artists #a-index").length) {
      Artists.replace_index();
    }
  }

  static initialize_hotkeys() {
    $(document).keydown("e", e => UI.openEditPage('artists'));
  }

  static replace_index() {
    let $table = $("#c-artists #a-index > table:nth-child(2)");

    let artists = _($table.find("> tbody > tr")).map(e => ({
      id:   $(e).attr("id").match(/artist-(\d+)/)[1],
      name: $(e).find("> td:nth-child(1) > a:nth-child(1)").text()
    }));

    let requests = [
      Artist.search(artists.map("id"), { order: UI.query("search[order]") }),
      Tag.search(artists.map("name"), { hide_empty: "no" }),
      Artist.index({ search: { is_active: true, order: "created_at" }, limit: 8 }),
      Artist.index({ search: { is_active: true, order: "updated_at" }, limit: 8 }),
      Artist.index({ search: { is_active: false, order: "updated_at" }, limit: 8 }),
    ]

    Promise.all(requests).then(([artists, tags, created, updated, deleted]) => {
      artists = artists.map(artist =>
        _.merge(artist, {
          tag: _(tags).find(["name", artist.name])
        })
      );

      let $paginator = $(".paginator");

      const index = Artists.render_index(artists, created, updated, deleted);
      $("#c-artists #a-index").addClass("ex-index").html(index);

      $paginator.appendTo("#content");
    });
  }

  static render_index(artists, created, updated, deleted) {
    return `
    <aside id="sidebar">
      ${Artists.render_sidebar(created, updated, deleted)}
    </aside>

    <section id="content">
      ${Artists.render_table(artists)}
    </section>
    `;
  }

  static render_sidebar(created, updated, deleted) {
    return `
    <section class="ex-artists-search">
      ${Artists.render_search_form()}
    </section>

    <section class="ex-artists-recent-changes">
      ${Artists.render_recent_changes(created, updated, deleted)}
    </section>
    `;
  }

  static render_search_form() {
    return `
    <h1>Search</h1>

    <form class="simple_form" action="/artists" accept-charset="UTF-8" method="get">
      <input name="utf8" type="hidden" value="✓">

      <label for="search_name">Name</label>
      <input type="text" name="search[name]"
            id="search_name" class="ui-autocomplete-input" autocomplete="off"
            placeholder="Search artist name or URL">

      <label for="search_order">Order</label>
      <select name="search[order]" id="search_order">
        <option value="created_at">Recently created</option>
        <option value="updated_at">Last updated</option>
        <option value="name">Name</option>
      </select>

      <input type="submit" name="commit" value="Search">
    </form>
    `;
  }

  static render_recent_changes(created, updated, deleted) {
    function render_artists_list(artists, heading, params) {
      return `
      <section class="ex-artists-list">
        <div class="ex-artists-list-heading">
          <h2>${heading}</h2>
          <span>
            (${UI.linkTo("more", "/artists", { search: params })})
          </span>
        </div>
        <ul>
          ${render_ul(artists)}
        </ul>
      </section>
      `;
    }

    function render_ul(artists) {
      return _(artists).map(artist => `
        <li class="category-1">
          ${UI.linkTo(artist.name, `/artists/${artist.id}`)}

	  <time class="ex-short-relative-time"
                datetime="${artist.updated_at}"
                title="${moment(artist.updated_at).format()}">
            ${moment(artist.updated_at).locale("en-short").fromNow()}
          </time>
        </li>
      `).join("");
    }

    return `
    <h1>Recent Changes</h1>

    ${render_artists_list(created, "New Artists",     { is_active: true,  order: "created_at" })}
    ${render_artists_list(updated, "Updated Artists", { is_active: true,  order: "updated_at" })}
    ${render_artists_list(deleted, "Deleted Artists", { is_active: false, order: "updated_at" })}
    `;
  }

  static render_table(artists) {
    return `
    <table class="ex-artists striped" width="100%">
      <thead>
        <tr>
          <th class="ex-artist-id">ID</th>
          <th class="ex-artist-name">Name</th>
          <th class="ex-artist-post-count">Posts</th>
          <th class="ex-artist-other-names">Other Names</th>
          <th class="ex-artist-group-name">Group</th>
          <th class="ex-artist-status">Status</th>
          <th class="ex-artist-created">Created</th>
          <th class="ex-artist-updated">Updated</th>
        </tr>
      </thead>
      <tbody>
        ${artists.map(Artists.render_row).join("")}
      </tbody>
    </table>
    `;
  }

  static render_row(artist) {
    const other_names =
      (artist.other_names || "")
      .split(/\s+/)
      .sort()
      .map(name =>
        UI.linkTo(name, "/artists", { search: { name: name }}, "ex-artist-other-name")
      )
      .join(", ");

    const group_link = UI.linkTo(
      artist.group_name, "/artists", { search: { name: `group:${artist.group_name}` }}, "ex-artist-group-name"
    );

    return `
    <tr class="ex-artist">
      <td class="ex-artist-id">
	${UI.linkTo(`artist #${artist.id}`, `/artists/${artist.id}`)}
      </td>
      <td class="ex-artist-name category-${artist.tag.category}">
	${UI.linkTo("?", "/wiki_pages", { title: artist.name }, "wiki-link")}
	${UI.linkTo(artist.name, `/artists/${artist.id}`, {}, "artist-link")}
      </td>
      <td class="ex-artist-post-count">
	${UI.linkTo(artist.tag.post_count, "/posts", { tags: artist.name }, "search-tag")}
      </td>
      <td class="ex-artist-other-names">
	${other_names}
      </td>
      <td class="ex-artist-group-name">
	${artist.group_name ? group_link : ""}
      </td>
      <td class="ex-artist-status">
	${artist.is_banned ? "Banned" : ""}
	${artist.is_active ? ""       : "Deleted"}
      </td>
      <td class="ex-artist-created">
	${moment(artist.created_at).fromNow()}
      </td>
      <td class="ex-artist-updated">
	${moment(artist.updated_at).fromNow()}
      </td>
    </tr>
    `;
  }
}
