import _ from "lodash";

export default class Tag {
  static get Categories() {
    return [
      "General",    // 0
      "Artist",     // 1
      undefined,    // 2 (unused)
      "Copyright",  // 3
      "Character"   // 4
    ];
  }

  // Collect tags in batches, with each batch having a max count of 1000
  // tags or a max combined size of 6500 bytes for all tags. This is
  // necessary because these are the API limits for the /tags.json call.
  static batch(tags) {
    let tag_batches = [[]];
    tags = _(tags).sortBy().sortedUniq().value();

    for (const tag of tags) {
      const current_batch = tag_batches[0];
      const next_batch = current_batch.concat([tag]);

      const batch_length = next_batch.map(encodeURIComponent).join(",").length;
      const batch_count = next_batch.length;

      if (batch_count > 1000 || batch_length > 6500) {
        tag_batches.unshift([tag]);
      } else {
        current_batch.push(tag);
      }
    }

    return _.reverse(tag_batches);
  }

  static search(tags) {
    const requests = Tag.batch(tags).map(batch => {
      const query = batch.map(encodeURIComponent).join(",");
      return $.getJSON(`/tags.json?limit=1000&search[hide_empty]=no&search[name]=${query}`);
    })

    return Promise.all(requests).then(tags => 
      _(tags).flatten().groupBy("name").mapValues(_.first).value()
    );
  }
}
