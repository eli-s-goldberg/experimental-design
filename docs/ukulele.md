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
} from "./components/ukuleleChordMethods.js"
```

# Ukulele

I love playing the ukulele. I hate the tab sites out there. I love observable framework js. I think I can make chord plots in observable js.

## Setting up

First, import the methods:

````md
```js
// Define the chord data
import {
  chordData,
  parseLyrics,
  ukuchord,
  strings,
  frets,
} from "./components/ukuleleChordMethods.js"
```
````

Then create the following function in your markdown file.

```js
function renderLyricsWithChords(lyrics) {
  const parsedLines = parseLyrics(lyrics)
  return html`${parsedLines.map(
    (lineParts) => html`
      <div style="display: flex; align-items: flex-start;">
        ${lineParts.map((part) =>
          part.chord
            ? html` <div
                style="display: flex; flex-direction: column; align-items: center; margin: 0 10px;"
              >
                <span style="margin-bottom: 5px;"></span>
                ${ukuchord(part.chord)}
              </div>`
            : html` <div
                style="display: flex; flex-direction: column; align-items: center; margin: 0 10px;"
              >
                <span>${part.text}</span>
              </div>`
        )}
      </div>
    `
  )}`
}
```

````md
```js
function renderLyricsWithChords(lyrics) {
  const parsedLines = parseLyrics(lyrics)
  return html`${parsedLines.map(
    (lineParts) => html`
      <div style="display: flex; align-items: center;">
        ${lineParts.map((part) =>
          part.chord
            ? html` <div
                style="display: flex; flex-direction: column; align-items: center; margin: 0 10px;"
              >
                ${ukuchord(part.chord)}
              </div>`
            : html` <span style="margin: 0 10px;">${part.text}</span>`
        )}
      </div>
    `
  )}`
}
```
````

## Individual chords

You can render invidivual chords with ease.

Simply put in the following:

```md
view(renderLyricsWithChords("<<Am>>"))
```

```js
view(renderLyricsWithChords("<<Am>>"))
```

## Rendering a chord chart

Here are the chords. I _think_ these are pretty close, but there may be some mistakes in them.

With the package I've developed, here's what you would run to get a chord chart:

````md
```js
const chord_chart = `
<<C>> <<C7>> <<Cm>> <<Cm7>> <<Cdim>> <<Caug>> <<C6>> <<Cmaj7>> <<C9>>
<<Db>> <<Db7>> <<Dbm>> <<Dbm7>> <<Dbdim>> <<Dbaug>> <<Db6>> <<Dbmaj7>> <<Db9>>
<<D>> <<D7>> <<Dm>> <<Dm7>> <<Ddim>> <<Daug>> <<D6>> <<Dmaj7>> <<D9>>
<<Eb>> <<Eb7>> <<Ebm>> <<Ebm7>> <<Ebdim>> <<Ebaug>> <<Eb6>> <<Ebmaj7>> <<Eb9>>
<<E>> <<E7>> <<Em>> <<Em7>> <<Edim>> <<Eaug>> <<E6>> <<Emaj7>> <<E9>>
<<F>> <<F7>> <<Fm>> <<Fm7>> <<Fdim>> <<Faug>> <<F6>> <<Fmaj7>> <<F9>>
<<Gb>> <<Gb7>> <<Gbm>> <<Gbm7>> <<Gbdim>> <<Gbaug>> <<Gb6>> <<Gbmaj7>> <<Gb9>>
<<G>> <<G7>> <<Gm>> <<Gm7>> <<Gdim>> <<Gaug>> <<G6>> <<Gmaj7>> <<G9>>
<<Ab>> <<Ab7>> <<Abm>> <<Abm7>> <<Abdim>> <<Abaug>> <<Ab6>> <<Abmaj7>> <<Ab9>>
<<A>> <<A7>> <<Am>> <<Am7>> <<Adim>> <<Aaug>> <<A6>> <<Amaj7>> <<A9>>
<<Bb>> <<Bb7>> <<Bbm>> <<Bbm7>> <<Bbdim>> <<Bbaug>> <<Bb6>> <<Bbmaj7>> <<Bb9>>
<<B>> <<B7>> <<Bm>> <<Bm7>> <<Bdim>> <<Baug>> <<B6>> <<Bmaj7>> <<B9>>
`

view(renderLyricsWithChords(chord_chart))
```
````

That would display the following:

```js
const chord_chart = `
<<C>> <<C7>> <<Cm>> <<Cm7>> <<Cdim>> <<Caug>> <<C6>> <<Cmaj7>> <<C9>>
<<Db>> <<Db7>> <<Dbm>> <<Dbm7>> <<Dbdim>> <<Dbaug>> <<Db6>> <<Dbmaj7>> <<Db9>>
<<D>> <<D7>> <<Dm>> <<Dm7>> <<Ddim>> <<Daug>> <<D6>> <<Dmaj7>> <<D9>>
<<Eb>> <<Eb7>> <<Ebm>> <<Ebm7>> <<Ebdim>> <<Ebaug>> <<Eb6>> <<Ebmaj7>> <<Eb9>>
<<E>> <<E7>> <<Em>> <<Em7>> <<Edim>> <<Eaug>> <<E6>> <<Emaj7>> <<E9>>
<<F>> <<F7>> <<Fm>> <<Fm7>> <<Fdim>> <<Faug>> <<F6>> <<Fmaj7>> <<F9>>
<<Gb>> <<Gb7>> <<Gbm>> <<Gbm7>> <<Gbdim>> <<Gbaug>> <<Gb6>> <<Gbmaj7>> <<Gb9>>
<<G>> <<G7>> <<Gm>> <<Gm7>> <<Gdim>> <<Gaug>> <<G6>> <<Gmaj7>> <<G9>>
<<Ab>> <<Ab7>> <<Abm>> <<Abm7>> <<Abdim>> <<Abaug>> <<Ab6>> <<Abmaj7>> <<Ab9>>
<<A>> <<A7>> <<Am>> <<Am7>> <<Adim>> <<Aaug>> <<A6>> <<Amaj7>> <<A9>>
<<Bb>> <<Bb7>> <<Bbm>> <<Bbm7>> <<Bbdim>> <<Bbaug>> <<Bb6>> <<Bbmaj7>> <<Bb9>>
<<B>> <<B7>> <<Bm>> <<Bm7>> <<Bdim>> <<Baug>> <<B6>> <<Bmaj7>> <<B9>>
`

view(renderLyricsWithChords(chord_chart))
```

## Rendering a song

Now let's render a simple song. How about "Riptide" by Vance Joy.

To do this, you need to write the lyrics in the following manner:

```verbatim
<<Am>> I was scared of <<G>> dentists and the <<C>> dark
<<Am>> I was scared of <<G>> pretty girls and <<C>> starting conversations
<<Am>> Oh, all my <<G>> friends are turning <<C>> green
<<Am>> You're the <<G>> magicians assistant in <<C>> their dreams
```

Then put them into a constant

````md
```js
const lyrics = `
<<Am>> I was scared of <<G>> dentists and the <<C>> dark
<<Am>> I was scared of <<G>> pretty girls and <<C>> starting conversations
<<Am>> Oh, all my <<G>> friends are turning <<C>> green
<<Am>> You're the <<G>> magicians assistant in <<C>> their dreams`
```
````

```js
const lyrics = `
<<Am>> I was scared of <<G>> dentists and the <<C>> dark
<<Am>> I was scared of <<G>> pretty girls and <<C>> starting conversations
<<Am>> Oh, all my <<G>> friends are turning <<C>> green
<<Am>> You're the <<G>> magicians assistant in <<C>> their dreams
`

view(renderLyricsWithChords(lyrics))
```

## Another example

```js
view(
  renderLyricsWithChords(`
<<C>> Wise <<Em>> men <<Am>> say, <<F>> only <<C>> fools <<G>> ruuuush in
<<F>> But <<G>> I <<Am>> can't <<F>> help <<C>> falling <<G>> in <<C>> loooove with you
<<C>> Shall <<Em>> I <<Am>> stay, <<F>> would <<C>> it <<G>> beeee aaaaa sin
<<F>> If <<G>> I <<Am>> can't <<F>> help <<C>> falling <<G>> in <<C>> loooove wiiiith you

Bridge:
<<Em>> Like a <<B7>> river <<Em>> flooows, <<B7>> surely <<Em>> to the <<B7>> sea
<<Em>> Darling <<B7>> so it <<Em>> goeeees, <<A7>> some things <<Dm>> are meant to <<G>> be

<<C>> Take <<Em>> my <<Am>> hand, <<F>> take <<C>> my <<G>> whooole life too
<<F>> For <<G>> I <<Am>> can't <<F>> help <<C>> faaalling <<G>> in <<C>> love with you

REPEAT BRIDGE

<<C>> Take <<Em>> my <<Am>> hand, <<F>> take <<C>> my <<G>> whooole life too
<<F>> For <<G>> I <<Am>> can't <<F>> help <<C>> faaalling <<G>> in <<C>> love with you
<<F>> For <<G>> I <<Am>> can't <<F>> help <<C>> faaalling <<G>> in <<C>> love with you
`)
)
```
