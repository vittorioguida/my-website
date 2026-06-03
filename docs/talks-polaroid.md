# Talks Polaroid Layout

The talks page is rendered from `Scripts/talksData.js` by `Scripts/talks.js`.

The talks-list card contract is:

- `talks.html` uses `<main class="talks-main">` so this page can be wider than the default editorial content width.
- `#talks-ul` is a CSS grid with at most three columns on desktop, two columns below `980px`, and one column below `768px`.
- Each `li.talk-item` is a polaroid-style card: centered image first, then title, then venue/date details.
- Cards keep a fixed `0.78` aspect ratio. The title band, photo, and venue band are reserved with explicit grid rows so text cannot resize the photo area.
- Full talks-page photos are centered inside the card so left and right frame spacing match.
- A compact fixed grid row gap separates the photo from the title band, while the venue band has extra top padding so venue text does not crowd the photo.
- Title and venue text are measured against their reserved bands after render and reduced until they fit. The same fit pass runs after font loading and window resize.
- The homepage renders three static mini-polaroids from the same data in the left column of the updates section: photo plus title only, with no carousel, venue, or description.
- Homepage mini-polaroids use a compact title band and run the same measured title-fitting pass so titles adapt to the available space.
- Homepage mini-polaroid titles use Roboto Mono and reserve a fixed white band below the title.
- Homepage mini-polaroids keep the horizontal photo frame wider than the vertical top and caption spacing.
- Descriptions from `desc` and `long_desc` are intentionally not rendered on the talks page or homepage talks preview.

Run the layout contract check with:

```sh
powershell -ExecutionPolicy Bypass -File tests/talks-polaroid.test.ps1
powershell -ExecutionPolicy Bypass -File tests/home-talks-polaroid.test.ps1
```
