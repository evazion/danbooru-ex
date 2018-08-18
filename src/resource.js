import _ from "lodash";
import EX from "./ex.js";

export default class Resource {
  constructor(object) {
    Object.assign(this, object);
  }

  static async request(type, url, params = {}) {
    const query = `${url}?${decodeURIComponent($.param(params))}`;

    // console.time(`${type} ${query}`);
    const request = $.ajax({ url, type: "POST", data: Object.assign({}, params, { _method: type })});
    const response = await request;

    EX.debug(`[NET] ${request.status} ${request.statusText} ${query}`, request)

    if (Array.isArray(response)) {
      return response.map(r => new this(r));
    } else {
      return new this(response);
    }
  }

  static put(id, params = {}) {
    return this.request("PUT", `${this.controller}/${id}.json`, params);
  }

  static get(id, params = {}) {
    return this.request("GET", `${this.controller}/${id}.json`, params);
  }

  static index(params = {}) {
    return this.request("GET", `${this.controller}.json`, params);
  }

  static search(values, otherParams) {
    const key = this.primaryKey;
    const batchedValues = _(values).sortBy().sortedUniq().chunk(1000).value();

    const requests = batchedValues.map(batch => {
      const params = _.merge(this.searchParams, { search: otherParams }, { search: { [key]: batch.join(",") }});
      return this.index(params);
    });

    return Promise.all(requests).then(_.flatten);
  }

  static get searchParams() {
    return { limit: 1000 };
  }

  static get controller() {
    return "/" + _.snakeCase(this.name + "s");
  }
}
