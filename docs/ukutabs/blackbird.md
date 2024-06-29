---
theme: light
title: Ukulele
toc: true
---

```js
// Define the chord data
import {
  chordData,
  parseLyrics,
  ukuchord,
  strings,
  frets,
} from "../components/ukuleleChordMethods.js";
```

# Blackbird - The Beatles

This is not the world's greatest version of this (it's actually terrible, I think).

However, here's a video:

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/EiFM2XKO9rk?si=Qq6YSTJ5C14xbd-I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

```js
function renderLyricsWithChords(lyrics) {
  const parsedLines = parseLyrics(lyrics);
  return html`${parsedLines.map(
    (lineParts) => html`
      <div
        style="display: flex; flex-direction: column; align-items: flex-start;"
      >
        <div style="display: flex;">
          ${lineParts.map(
            (part) =>
              html`<div style="margin: 0 10px; text-align: center;">
                ${part.text.replace(/<<[^>]+>>/g, "")}
              </div>`
          )}
        </div>
        <div style="display: flex;">
          ${lineParts.map(
            (part) =>
              html`<div style="margin: 0 10px; text-align: center;">
                ${part.chord ? ukuchord(part.chord) : ""}
              </div>`
          )}
        </div>
      </div>
    `
  )}`;
}
```

```js
const blackbird_beatles = `<<G>> Blackbird <<Am>> singing  in the dead <<G>> of night
<<G>> Take these <<Am>> broken wings and learn to <<G>> fly
<<D>> All your <<Em>> life
<<G>> You were only <<A7>> waiting for this moment to a<<C>>rise  <<G>>

<<G>> Blackbird <<Am>> singing  in the dead <<G>> of night
<<G>> Take these <<Am>> sunken eyes and learn to <<G>> see
<<D>> All your <<Em>> life
<<G>> You were only <<A7>> waiting for this moment to be <<C>> free  <<G>>

<<G>> Blackbird <<Am>> fly, <<G>> blackbird <<Am>> fly
<<G>> Into the <<Am>> light of the dark black <<C>> night

<<G>> Blackbird <<Am>> fly, <<G>> blackbird <<Am>> fly
<<G>> Into the <<Am>> light of the dark black <<C>> night

<<G>> Blackbird <<Am>> singing  in the dead <<G>> of night
<<G>> Take these <<Am>> broken wings and learn to <<G>> fly
<<D>> All your <<Em>> life
<<G>> You were only <<A7>> waiting for this moment to a<<C>>rise  <<G>>
<<G>> You were only <<A7>> waiting for this moment to a<<C>>rise  <<G>>
<<G>> You were only <<A7>> waiting for this moment to a<<C>>rise  <<G>>
`;
```

<style>
    .shrink-wrapper {
        transform: scale(0.7); /* Adjust the scale value to shrink */
        transform-origin: top left; /* Keep the content aligned */
    }
</style>

<div class="shrink-wrapper">

```js
view(renderLyricsWithChords(blackbird_beatles));
```

</div>
