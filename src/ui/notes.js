import _ from "lodash";

export default class Notes {
  static initialize() {
    $(Notes.initializeLivePreview);
  }

  static initializeLivePreview() {
    Danbooru.Note.Edit.show = _.wrap(Danbooru.Note.Edit.show, (show, ...args) => {
      show(...args);

      $(".note-edit-dialog textarea").off("input").on("input", _.throttle(Notes.updatePreview, 32));
    });
  }

  static updatePreview(event) {
    const $textarea = $(event.target);
    const note_id = $textarea.closest(".ui-dialog-content").data("id");
    const $note_body = Danbooru.Note.Body.find(note_id);
    const $note_box = Danbooru.Note.Box.find(note_id);

    Danbooru.Note.Body.set_text($note_body, $note_box, $textarea.val());
    Danbooru.Note.Body.show(note_id);
  }
}
