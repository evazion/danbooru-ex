import _ from "lodash";
import $ from "jquery";

export default class Resource {
  static search(param, values) {
    const requests = this.batch(values).map(batch => {
      const url = "/" + _.snakeCase(this.name.toLowerCase() + "s");
      const params = _.merge(this.searchParams, { search: { [param]: batch.join(",") }});
      const query = `${url}.json?${decodeURIComponent($.param(params))}`;
      const request = $.getJSON(url, params);

      console.time(`GET ${query}`);
      console.log(`[NET] GET ${query}`, request);

      return request.always(() => {
        console.timeEnd(`GET ${query}`);
        console.log(`[NET] ${request.status} ${request.statusText} ${query}`, request)
      });
    });

    return Promise.all(requests).then(_.flatten);
  }

  // Collect items in batches, with each batch having a max count of 1000 items
  // or a max combined size of 6500 bytes for all items. This is necessary
  // because these are the parameter limits for requests to the API.
  static batch(items, limit = 1000, maxLength = 6500) {
    let item_batches = [[]];
    items = _(items).sortBy().sortedUniq().value();

    for (const item of items) {
      const current_batch = item_batches[0];
      const next_batch = current_batch.concat([item]);

      const batch_length = next_batch.map(encodeURIComponent).join(",").length;
      const batch_count = next_batch.length;

      if (batch_count > limit || batch_length > maxLength) {
        item_batches.unshift([item]);
      } else {
        current_batch.push(item);
      }
    }

    return _(item_batches).reject(_.isEmpty).reverse().value();
  }

  static get searchParams() {
    return { limit: 1000 };
  }
}
