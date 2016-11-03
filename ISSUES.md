* Header
** Layout breaks at <960px or so.

* Sidebar
** Resizeable sidebar doesn't work on /artists or /wiki_pages.

* Preview panel
** Doesn't work on popular pages and /post_versions.
** Broken on webm/mp4/ugoira.
** Can't resize wide enough on posts with too many children in parent/child bar.
** Should include metadata: tags, pools, notes, comments, parent/children, etc.
** Should include tag edit box.
** Left click image should toggle between fit vertical, fit horizontal, and full size
** Drag should pan around full size.
** Middle click image should open post in new tab.
** Should be able to see all selected posts in preview panel by scrolling up and down.

* Thumbnails previews
** Broken on webm/mp4/ugoira.
** Placement can be very wonky.
** Currently disabled in preview/tag script mode - need a smarter way to
   trigger popups so they don't get in the way.

* Tag scripts
** Sometimes Ctrl+A selects all text on page.
** Dragging unselects currently selected posts. Holding shift while dragging
   should add posts to selection.
** Should be able to shift+click to select everything between two points.
** Ctrl+T should invert script (foo -bar becomes -foo bar).
** Should support ctrl+z to undo.

* Mode menu
** If you're in preview mode or tag script mode on /posts and you visit a post
   (or anywhere else), you will still be in that mode. This is annoying.

* Wiki:
*** Collapsible headers:
*** Uncollapses lower level headings if they're already collapsed.
*** Interfere with existing table of contents.
*** Have alignment issues.
*** Are generally annoying.

* Tags on posts and comments don't get tooltips.
* Tags in DText previews aren't colorized and don't get tooltips.

* @mentions and user #1234 links aren't colorized or given data attributes.
* Colorizing user links can't handle more than 1000 usernames being on one page.

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
