import _ from "lodash";

export default class PseudoTagTypes {
  static initialize() {
    const $links = $(`a[href^="/posts?tags="]`);
    if ($links.length === 0) {
      return;
    }

    const requests = [
      $.getJSON("/related_tag.json?category=general&query=tag_group:meme"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:image_composition"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:text"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:artistic_license"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:posture"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:face_tags"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:hair_color"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:hair_styles"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:hair"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:body-parts"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:nudity"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:sex_acts"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:sexual_positions"),
      $.getJSON("/related_tag.json?category=general&query=tag_group:attire"),
    ];

    Promise.all(requests).then(allRelatedTags => {
      // Merge all related tags lists into one big { "tag": [ "tag-group" ] } object.
      const tagGroups = allRelatedTags.map(relatedTags => {
        const tagGroup = _.kebabCase(relatedTags.query.replace(/tag_group:/, ""));
        const tagsToGroup =
          _(relatedTags.wiki_page_tags)
          .map("[0]")
          .map(tag => ({ [tag]: [tagGroup] }))
          .reduce(_.merge);

          return tagsToGroup;
      }).reduce(_.merge);

      $links.each((i, e) => {
        const $tagLink = $(e);
        const tag = decodeURIComponent($(e).attr("href").replace(/\/posts\?tags=/, ""));

        _(tagGroups[tag]).each(type => {
          $tagLink.addClass(`ex-tag-type-${type}`);
          $tagLink.parent('[class^="category-"]').addClass(`ex-tag-type-${type}`);
        });
      });
    });
  }
}
