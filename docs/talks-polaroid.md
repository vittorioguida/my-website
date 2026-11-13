# Talks Timeline Layout

The talks page is rendered from `Scripts/talksData.js` by `Scripts/talks.js`.

The talks-list card contract is:

- `talks.html` uses `<main class="talks-main">` so this page can be wider than the default editorial content width.
- Talks are sorted newest first and rendered as an ordered list on a horizontal timeline, with a marker and date above each card.
- The timeline scrolls horizontally using buttons, keyboard arrows, touch, or its scrollbar. It shows three cards on wide screens, two on medium screens, and one on narrow screens.
- Each card shows the date, photo, title, venue, and location. Its title overlays the bottom of the photo with a blurred backdrop, matching the separate homepage carousel preview; the homepage navigation arrows also overlay the image.
- Venue and location text beneath each photo uses the smaller monospace text size.
- The homepage updates grid uses equal-height rows so the publications and talks panels stay the same height as their content changes, including in the stacked mobile layout.
- Descriptions from `desc` and `long_desc` are intentionally not rendered on the talks page or homepage talks preview.

Review these notes after changing `index.html`, `Scripts/talks.js`, or the talks/home updates blocks in `Styles/style.css`.
