import _ from "lodash";

export default class DText {
  static createExpandable(name, content) {
    const $expandable = $(`
      <div class="expandable">
        <div class="expandable-header">
          <span>${_.escape(name)}</span>
          <input type="button" value="Show" class="expandable-button">
        </div>
        <div class="expandable-content" style="display: none">
          ${content}
        </div>
      </div>
    `);

    // If our script runs before Danbooru's scripts do, Danbooru will find our
    // expandable and add it's own click handler on top of ours. So delay
    // adding our handler to make sure we overwrite Danbooru's own handler.
    $(function () {
      $expandable.find('.expandable-button').off("click").click(e => {
        $(e.target).closest('.expandable').find('.expandable-content').fadeToggle('fast');
        $(e.target).val((_, val) => val === 'Show' ? 'Hide' : 'Show');
        e.preventDefault();
      });
    });

    return $expandable;
  }
}
