import DText from "../dtext.js";

export default class WikiPages {
  // Add collapse/expand button to headings.
  static initialize_collapsible_headings() {
    const $headings = $("#wiki-page-body").find('h1,h2,h3,h4,h5,h6');

    if ($headings.length < 3) {
      return;
    }

    $headings.prepend(
      $('<a class="ui-icon ui-icon-triangle-1-s collapsible-header"></a>')
    ).click(e => {
      const $button = $(e.target);

      // Collapse everything up to the next heading at the same
      // level, or up to the alias/implication list at the bottom of the page.
      $button.toggleClass('ui-icon-triangle-1-e ui-icon-triangle-1-s');
      $button.parent('h1').nextUntil('p.hint, h1').slideToggle();
      $button.parent('h2').nextUntil('p.hint, h1, h2').slideToggle();
      $button.parent('h3').nextUntil('p.hint, h1, h2, h3').slideToggle();
      $button.parent('h4').nextUntil('p.hint, h1, h2, h3, h4').slideToggle();
      $button.parent('h5').nextUntil('p.hint, h1, h2, h3, h4, h5').slideToggle();
      $button.parent('h6').nextUntil('p.hint, h1, h2, h3, h4, h5, h6').slideToggle();
    });
  }

  // Add Table of Contents expandable.
  static initialize_table_of_contents() {
    const $headings = $("#wiki-page-body").find('h1,h2,h3,h4,h5,h6');

    if ($headings.length < 3) {
      return;
    }

    const $toc =
      DText.create_expandable('Table of Contents', '<ul></ul>').prependTo('#wiki-page-body');

    /* 
     * Build ToC. Create a nested heirarchy matching the hierarchy of
     * headings on the page; an h5 following an h4 opens a new submenu,
     * another h4 closes the submenu. Likewise for h5, h6, etc.
     */
    let $submenu = null;
    let $menu = $toc.find('ul');
    let level = $headings.length > 0
              ? parseInt($headings.first().get(0).tagName[1])
              : undefined;

    $headings.each((i, e) => {
      const header = $(e).text();
      const anchor =
        'dtext-' + header.toLowerCase()
                    .replace(/[^a-z]+/g, '-')
                    .replace(/^-|-$/, '');

      const next_level = parseInt(e.tagName[1]);
      if (next_level > level) {
        $submenu = $('<ul></ul>');
        $menu.append($submenu);
        $menu = $submenu;
      } else if (next_level < level) {
        $menu = $menu.parent();
      }

      $(e).attr('id', anchor);
      $menu.append($(
        `<li><a href="#${anchor}">${header}</a></li>`
      ));

      level = next_level;
    });
  }
}
