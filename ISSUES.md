* Header
** Layout breaks at <960px or so.

* Sidebar
** Resizeable sidebar doesn't work on /artists page.

* Preview panel
** Should include metadata: tags, pools, notes, comments, parent/children, etc.
** Should include tag edit box.
** Left click image should toggle between fit vertical, fit horizontal, and full size
** Drag should pan around full size.
** Middle click image should open post in new tab.
** Should be able to see all selected posts in preview panel by scrolling up and down.

* Thumbnails previews
** Placement can be very wonky.
** Currently disabled in when preview panel is open - need a smarter way to
   trigger popups so they don't get in the way.

* Tag scripts
** Sometimes Ctrl+A selects all text on page. Caused when an <input> (i.e. mode select box) has focus.
** Dragging unselects currently selected posts. Holding shift while dragging
   should add posts to selection.
** Ctrl+T should invert script (foo -bar becomes -foo bar).
** Should support ctrl+z to undo.
** Middle click removes cursor highlight.

* Wiki:
** Collapsible headers:
** Uncollapses lower level headings if they're already collapsed.
** Have alignment issues.
** Are generally annoying.

* /users/1234 expandable post sections:
** Blacklists may not work on loaded posts.
** Additional posts aren't loaded properly for uncategorized saved searches (Danbooru bug).

* Note live preview:
** Can be wonky when in the middle of typing html since the html is invalid and incomplete.

* Tags on posts and comments don't get tooltips.
* Tags in DText previews aren't colorized and don't get tooltips.

* @mentions and user #1234 links aren't colorized or given data attributes.

* Username tooltips are broken sometimes - use albert's info instead.

* /artists:
** Broken on http://danbooru.donmai.us/artists?search[order]=name
*** Problem is an artist entry with a blank name. Should validate artist name is non-blank server-side.
** Clicking a group name should search all name fields (name, other names, group), not just group names.
** Searches should be wildcard searches (if user has permission for it).
** Should show aliases somehow. Some posts counts are wrong because the artist was aliased & moved.
** Should prettify artist tags (i.e. "tony_taka" -> "tony taka")
** Should parse pixiv/twitter out of urls and include columns for those.
** Should include last updater.
** Should include version number.
** Should use stupid_table.js to make table sortable.
** /artists sidebar
*** Long artist names should be truncated to avoid line wrapping.
*** Headings should be collapsible.
*** Lists should have a "More..." link at the bottom to load more entries.
