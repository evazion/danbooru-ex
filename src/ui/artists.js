import EX from "../ex.js";
import UI from "../ui.js";

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

    let artists = _($table.find("> tbody > tr")).map(e => new Object({
      id:   $(e).attr("id").match(/artist-(\d+)/)[1],
      name: $(e).find("> td:nth-child(1) > a:nth-child(1)").text()
    }));

    let requests = [
      EX.search("/artists.json", { id: artists.map("id").join(","), order: UI.query("search[order]") }),
      EX.search("/tags.json",    { name: artists.map("name").join(","), hide_empty: "no" }),
    ]

    Promise.all(requests).then(([artists, tags]) => {
      artists = artists.map(artist =>
        _.merge(artist, {
          tag: _(tags).find(["name", artist.name])
        })
      );

      const html = Artists.render_artist_table(artists);
      $table.addClass("artist-table").html(html).show();
    });
  }

  static render_artist_table(artists) {
    return `
      <thead>
        <tr>
          <th class="artist-id">ID</th>
          <th class="artist-name">Name</th>
          <th class="artist-post-count">Posts</th>
          <th class="artist-other-names">Other Names</th>
          <th class="artist-group-name">Group</th>
          <th class="artist-status">Status</th>
          <th class="artist-created">Created</th>
          <th class="artist-updated">Updated</th>
        </tr>
      </thead>
      <tbody>
        ${artists.map(Artists.render_row).join("")}
      </tbody
    `;
  }

  static render_row(artist) {
    const other_names =
      (artist.other_names || "")
      .split(/\s+/)
      .sort()
      .map(name =>
        UI.linkTo(name, "/artists", { search: { name: name }}, "artist-other-name")
      )
      .join(", ");

    const group_link = UI.linkTo(
      artist.group_name, "/artists", { search: { name: `group:${artist.group_name}` }}, "artist-group-name"
    );

    return `
      <tr>
        <td class="artist-id">
          ${UI.linkTo(`artist #${artist.id}`, `/artists/${artist.id}`)}
        </td>
        <td class="artist-name category-${artist.tag.category}">
          ${UI.linkTo("?", "/wiki_pages", { title: artist.name }, "wiki-link")}
          ${UI.linkTo(artist.name, `/artists/${artist.id}`, {}, "artist-link")}
        </td>
        <td class="artist-post-count">
          ${UI.linkTo(artist.tag.post_count, "/posts", { tags: artist.name }, "search-tag")}
        </td>
        <td class="artist-other-names">
          ${other_names}
        </td>
        <td class="artist-group-name">
          ${artist.group_name ? group_link : ""}
        </td>
        <td class="artist-status">
          ${artist.is_banned ? "Banned" : ""}
          ${artist.is_active ? ""       : "Deleted"}
        </td>
        <td class="artist-created">
          ${moment(artist.created_at).fromNow()}
        </td>
        <td class="artist-updated">
          ${moment(artist.updated_at).fromNow()}
        </td>
      </tr>
    `;
  }
}
