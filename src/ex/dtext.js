export default class DText {
  static create_expandable(name, content) {
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

    $expandable.find('.expandable-button').click(e => {
      $(e.target).closest('.expandable').find('.expandable-content').fadeToggle('fast');
      $(e.target).val((_, val) => val === 'Show' ? 'Hide' : 'Show');
    });

    return $expandable;
  }
}
