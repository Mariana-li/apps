# Vitals

A static web app that shows one health fact a day. Installable to a phone home screen,
works offline, stores everything on the device. No server, no accounts, no analytics.

Lives at `vitals/` inside this repo. Published with GitHub Pages from `main`, root folder,
so the address is `https://Mariana-li.github.io/apps/vitals/`. Other apps may be added as
sibling folders later.

## Structure

Everything is in `vitals/index.html`: markup, CSS, illustrations and all 179 facts, about
155KB. No build step, no dependencies, no framework. Alongside it:

- `sw.js` service worker, caches every file for offline use
- `manifest.webmanifest` name, icons, colours, standalone display
- `icon-180.png` `icon-512.png` `icon-1024.png`
- `fonts/` six woff2 files, Fredoka and Nunito, Latin subsets, self hosted

## Deploying

`git push` republishes within a minute or two. **Every change to any file needs the cache
name in `sw.js` bumped** (`vitals-v3` to `vitals-v4` and so on) in the same commit.
Installed copies serve their cached files first, so without the bump they keep the old build
indefinitely. This is the single easiest thing to forget.

## Content model

Facts live in three arrays: `FACTS_1`, `FACTS_2`, `FACTS_3`.

```js
{id:"caffeine-half-life", c:"caffeine",
 t:"Half of a 3pm coffee is still in you at 8pm.",
 w:"Caffeine takes about 5 hours to drop by half...",
 a:["Stop 8 hours before bed...", "..."]}
```

- **`id` is permanent.** Saved pages and the per-day record both point at it. Renaming one
  silently breaks somebody's saved list. Never reuse an id either.
- `c` is the narrow tag. It picks the character and maps to a broad display category via
  `CAT_OF`. A tag missing from `CAT_OF` falls back to "curious body", and the code warns to
  the console at load, so check the console after adding facts.
- `t` headline, `w` the reason, `a` optional steps. `a` is genuinely optional: many facts
  are curiosities and inventing advice for them is padding.

Adding facts is safe at any time. Each day's fact is chosen once and written to storage, so
existing readers keep their history and new facts join the unseen pool. When the unseen pool
empties, a second pass starts in a different order.

## Illustrations

`artFor()` picks in this order:

1. `ART[f.art]` a bespoke hand drawn scene with a caption. 21 of these.
2. `SCENES[f.id]` a spec rendered by a layout. Four wordless layouts: `seq` a process left
   to right, `cmp` two states either side of a divider with a tick or cross, `many` counting
   objects to show proportion, `lanes` two competing routes stacked. Older `flow`, `vs` and
   `parts` layouts use text cards and are being replaced.
3. `MASCOT[...]` the subject's character, decorative only.

Pictures are built from `PROPS`, about 58 small cute objects drawn around their own centre.
All line art runs through a wobble filter so it looks hand drawn. **No lettering inside
illustrations.** Meaning comes from shape, colour, count, size and the badge. Captions sit
underneath, outside the drawing.

## Writing rules

- Plain English, but keep the precision and the numbers. Simplify wording, not content.
- **No em dashes and no en dashes anywhere.** Write ranges as "1350ppm or higher" or
  "8 to 12 weeks". This is checked, the file currently has zero of both.
- No "actually", "genuinely", "honestly", "truly", "really".
- Say what happens to what, not shorthand. Name the number, the direction, the mechanism.
- Actions must be specific enough to act on today: the exact settings path, the ppm number,
  the words to say to an ambulance dispatcher. "Drink more water" is not an action.
- Headlines run 44 to 90 characters. `w` is one or two sentences.

## Accuracy

This app tells people how deep to press during CPR and how long to hold a nosebleed. Every
number must be checkable against a real source. Do not invent figures, do not round for
neatness, and do not soften a claim into vagueness to avoid checking it. Where evidence is
observational or contested, say so in `w` rather than implying certainty. If a fact cannot be
stated accurately in the space available, leave it out.

## Design

Palette: indigo `#22355C` ink, vermilion `#C64A31` accent, paper `#F0EDE6`, wall `#16213A`,
mint `#7FC0AC` and sand `#EFC98A` in illustrations. Each of the 17 broad categories has its
own colour in `CATS`, all verified at 4.5:1 or better against the paper background. Keep new
ones above that.

Fonts: Fredoka for display, Nunito for reading text.

Layout is a tear-off day calendar: indigo binder board, paper page with a scalloped bottom
edge. Body padding uses `env(safe-area-inset-*)` because the page is `viewport-fit=cover`
with a translucent iOS status bar. Hard coded top padding puts the board under the clock.

## Before committing

There is no test suite, so check by hand:

1. Every `el("x")` in the script has a matching `id="x"` in the markup. A mismatch throws
   partway through `render()` and the page half draws. This has happened.
2. `node --check` on the extracted script.
3. Open the file in a browser and confirm the headline, the illustration and the expanded
   panel all appear.
4. Search for em dashes and en dashes.
5. `grep 'const CACHE' vitals/sw.js` shows a bumped version.

## Constraints

- Do not add analytics, tracking, or any network request after first load. Nothing leaves
  the device, and the README says so.
- Do not add a build step or a dependency. One file that opens in a browser is the point.
- Do not rewrite git history or force push.
- The service worker only deletes caches beginning `vitals-`, so it cannot wipe a sibling
  app's offline files. Any new app in this repo needs the same guard.
- `localStorage` is shared across every app on `Mariana-li.github.io`. Vitals uses keys
  beginning `vitals:`. Give any new app its own prefix.

## Known work outstanding

- 56 pages still use the text-card scene layouts and should move to wordless pictures.
- 36 pages still show only a character and need a picture spec.
- The 21 bespoke drawings still contain internal labels, against the no-lettering rule.
  Undecided whether to redraw them or move the labels into captions.
- 179 facts is about six months before anything repeats. Target is 365.
- No daily reminder. This is the main gap in the home screen version and the thing that
  would make an App Store submission defensible under guideline 4.2.
