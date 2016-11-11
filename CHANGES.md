# Release 2284

#### Features

* On account pages, add button to load more posts in uploads / favorites / saved search sections (https://gfycat.com/ImpartialEverlastingIceblueredtopzebra).
* Also make uploads / favorites / saved search sections hideable.
* Add live, as-you-type preview when editing notes (https://gfycat.com/DeficientInconsequentialCottontail).
* Add ctrl+enter shortcut for submitting wiki entries / comments / forum posts.
* Add option to enabling looping for video_with_sound posts by default.
* Add option to mute video_with_sound posts by default.
* Wordbreak long usernames (e.g. GiantCaveMushroom) better in comments and forum posts.

#### Fixes

* Performance improvements.
* Fix brokenness on Firefox.
* Fix thumbnail hover previews to work for webm/mp4/ugoira posts.
* Fix sidebar squashing issues by fitting images to screen width.
* Make preview panel work on /post_versions, /post_flags, /post_appeals.

# Release 1339

* Fix broken Show button in Table of Contents expandables in the wiki.
* Don't add automatic Table of Contents to wiki pages that already have one.

# Release 1337

* Add settings page for disabling tweaks under My Account > Settings > EX Settings.

# Release 1322

* Add debug output.

* Partial fixes for broken header/nav menu layout at <660px.

* Disable sidebar and preview panel at <660px.

# Release 1301

* Greatly improved performance and reduced flickering.

* Add preview panel. Switch to Preview mode using the Mode menu or by pressing ~ (tilde).
  In preview mode clicking thumbnails will open the full image in a preview panel.

* Redesigned tag script mode: Clicking thumbnails selects the post and opens a
  preview instead of applying tags immediately. After your posts are selected,
  click Apply or press Shift+A to apply tags. This helps you avoid misclicks and
  lets you see the full image as you work.

* Make the tag sidebar resizeable: collapse it to gain space, or expand it so
  those annoying long tags are more readable.

* Make the search bar closeable so it doesn't follow you as you scroll (I like
  it but I'm sure some of you hate that).

* Add configuration options. Edit the variables at the top of the script to
  disable tweaks you don't want.

* Underline bad wiki links (links to empty or nonexistent tags).

* Press Ctrl+enter in search bar to open search in a new tab.

# Fixes

* Fix broken autocomplete in search bar.
* Fix mode menu brokeness.
* Fix header layout brokenness at smaller screen widths (should work up to ~960px).
