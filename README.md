Danbooru EX is a userscript that adds a variety of enhancements and new
features that make using Danbooru faster and easier.

# Installation

For Chrome: Install Tampermonkey - https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en
For Firefox: Install Greasemonkey - https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/

Install the script: https://github.com/evazion/danbooru-ex/raw/stable/dist/danbooru-ex.user.js

# Configuration

See the instructions at the top of the script for how to disable tweaks you don't want.

# Main features

* Thumbnail previews: hover over a thumbnail or post #1234 link to see a large image preview.

* Preview panel: Select Preview from the Mode menu then click a thumbnail. A
  panel will appear showing you the full size image.

* Redesigned tag script mode: Clicking thumbnails selects the post and opens a
  preview instead of applying tags immediately. After your posts are selected,
  click Apply or press Shift+A to apply tags. This helps you avoid misclicks and
  lets you see the full image as you work.

* Add search bar and mode menu in the header. This lets you:

1. Have enough space to see the whole search in the search bar.
2. Start new tag searches anywhere.
3. Use tag scripts everywhere.

* The search bar scrolls with the page. This lets you search and use tag
  scripts without scrolling back and forth.

* The tag sidebar is resizeable. Collapse it to get more space, or expand it
  to read long tags.

* Tags are colorized by type in the wiki and the forum.

# Minor features

* Underline bad links in the wiki (links to empty tags or tags that don't exist).

* Add extra data attributes and CSS classes to tags and usernames, for custom CSS styling.

* Replace fixed times ("2016-08-10") with relative times ("3 months ago").

## Preview mode

* Choose Preview from the Mode menu or press ~ (tilde) to enter Preview mode.
* In Preview mode clicking a thumbnail opens the full image in the preview
  panel on the right side of the screen.
* Press Escape or ~ again to leave Preview mode.
* The preview panel can be resized by dragging the edge.

## Tag script mode

* Choose Tag Script from the Mode menu or press a number key (1-9) to switch to
  a tag script.
* Click thumbnails to select/deselect them, then click 'Apply' or press
  `Shift+A` to apply tags to selection.
* Drag and highlight to select multiple thumbnails at once.
* Use Ctrl+A to select all or select none.
* Use Ctrl+I to invert selection.
* Press number key twice to focus tag script box.
* Press Escape to leave Tag Script mode.

# Keyboard Shortcuts

## Sitewide

* Escape: Close popup notices.
* Shift+1..9: Jump to page 1..9.
* Shift+0: Jump to last page.

## Searchbar

* Shift+Q: Focus search box.
* Ctrl+Enter: Open search in new tab.

## Mode menu

* ~ (tilde): Enter preview mode. Press again to exit.
* 1, 2, ... 9: Enter tag script mode with tag script #1, #2, etc. Press again
  to focus tag script box.
* Escape: Exit tag script mode or preview mode.

## Tag script mode

* Shift+A: Apply tag script to selected thumbnails.
* Ctrl+A: Toggle between select all and select none.
* Ctrl+I: Invert selection.

## /artists/1234

* E: Edit artist.

## /pools/1234

* E: Edit pool.

## /posts/1234

* Alt+S: Rate safe.
* Alt+Q: Rate questionable.
* Alt+E: Rate explicit.
*     U: Upvote.
* Alt+U: Downvote.
