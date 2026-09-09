# Vitals

One health fact a day. 179 facts, each with the reason behind it and, where there is one, something specific to do. One page per day, chosen once and recorded, so it cannot be reshuffled by later changes.

## What is in here

| File | What it does |
|---|---|
| `index.html` | The whole app. Markup, styles, illustrations and 179 facts in one file. |
| `manifest.webmanifest` | Tells a phone the app's name, icon, colours, and that it opens full screen. |
| `sw.js` | Service worker: keeps a copy of every file so the app opens with no signal. |
| `icon-180.png` | Home screen icon on iOS. |
| `icon-512.png` | Home screen icon on Android, and the maskable version. |
| `icon-1024.png` | Store listing icon. Not used by the web app. |
| `fonts/` | Fredoka and Nunito, Latin subsets only, 108KB total. Bundled so nothing loads from Google. |

No build step, no dependencies, no server code. Total size about 320KB.

## Data and privacy

Saved facts, the streak and the record of which fact each day showed are kept in the browser's own `localStorage` on the device. Nothing is sent anywhere. There is no account, no analytics and no network request after the first load.

---

# Part 1: put it in a git repo

```bash
cd vitals                 # the folder holding index.html
git init
git add .
git commit -m "Vitals: one health fact a day"
```

Make an empty repository on github.com. Do not add a README or a licence there, or the first push will conflict. Then:

```bash
git remote add origin https://github.com/YOURNAME/vitals.git
git branch -M main
git push -u origin main
```

# Part 2: the web app

GitHub Pages serves the folder as a website over HTTPS, which the service worker requires.

1. Repository → **Settings** → **Pages**.
2. Source: **Deploy from a branch**. Branch `main`, folder `/ (root)`. Save.
3. Wait one to two minutes. The address appears at the top of that screen: `https://YOURNAME.github.io/vitals/`.
4. The **Actions** tab shows a green tick when publishing finished, or a red cross with the reason.

Free accounts only serve public repositories. The app holds no secrets, so that is fine.

## Several apps in one repo

Pages serves any folder structure, so `apps/vitals/` and `apps/other/` become
`yourname.github.io/apps/vitals/` and `.../apps/other/`. Every path in `index.html` is
relative, so moving this folder deeper changes nothing.

Two things are shared across every app on that domain, because they belong to the origin
rather than the folder:

- **`localStorage`.** This app uses keys beginning `vitals:`. Give each app its own prefix.
- **The cache store.** `sw.js` only deletes caches beginning `vitals-`, so it cannot wipe
  a neighbour's offline files. Any other app's service worker needs the same guard, or it
  will delete this one's cache on its next activation.

To use your own domain: add a file named `CNAME` containing `vitals.example.com`, point a CNAME record at `YOURNAME.github.io`, then tick **Enforce HTTPS** in the Pages settings once the certificate is issued.

## Installing it on a phone

- **iPhone:** open the address in Safari, not Chrome. Share → Add to Home Screen. It launches full screen with no address bar.
- **Android:** open in Chrome. Menu → Install app.

The first visit downloads and caches everything, so from then on it opens offline.

## Publishing a change

```bash
git add . && git commit -m "what changed" && git push
```

One catch: installed copies serve the cached files first, so they keep showing the old version. Change the first line of `sw.js` from `vitals-v1` to `vitals-v2` in the same commit. A new cache name makes every installed copy discard the old files and fetch the new ones.

---

# Part 3: the mobile app

Two routes, and they are not equally worth it.

## Route A: the home screen app you already have

Add to Home Screen gives you an icon, full screen, offline, and instant updates. No developer account, no review, no fees. For an app that shows one page a day and stores everything on the device, this covers nearly everything the store version would.

What it cannot do: appear in App Store or Play search, send push notifications on iOS unless the user installs it to the home screen first, or use a widget.

## Route B: real store apps, using Capacitor

Capacitor wraps these same files in a native shell. One codebase, two stores.

### Set up

```bash
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init Vitals com.yourname.vitals --web-dir=.
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
npx cap sync
```

`--web-dir=.` points Capacitor at this folder. Keep `index.html` at the root of it.

Delete the service worker registration for the native builds, or leave it: it is inert because Capacitor serves from `capacitor://localhost`, not `https:`, and the registration is already guarded by a protocol check.

### Android

1. Install Android Studio. `npx cap open android`.
2. Drop `icon-1024.png` into the icon generator: right click `res` → New → Image Asset.
3. Build → Generate Signed Bundle → **Android App Bundle**. Create a keystore and back it up somewhere permanent. Lose it and you can never update the app.
4. Google Play Console: one-off 25 USD. Create the app, upload the `.aab`, fill in the store listing, privacy policy URL, and the data safety form. Say that no data leaves the device, because none does.
5. First review typically a few days. New personal developer accounts also need 12 testers running a closed test for 14 days before production access.

### iOS

1. macOS and Xcode are required. `npx cap open ios`.
2. Apple Developer Program: 99 USD a year.
3. In Xcode: set the bundle identifier, signing team, and drop the 1024px icon into the asset catalogue.
4. Product → Archive → Distribute App → App Store Connect.
5. Fill in the listing, screenshots at the required sizes, and the privacy questionnaire.

### The risk worth knowing before you pay Apple

App Store Review Guideline 4.2 rejects apps that are simply a repackaged website. A daily fact reader with local storage is close to that line. Things that move it clearly across: local notifications for the daily page, a home screen widget, Apple Health integration, or a share sheet. Add at least one before submitting.

Android is more relaxed about this. If you want a store presence cheaply, Play alone is the sensible first step.

## Cost summary

| Route | Cost | Time to live |
|---|---|---|
| GitHub Pages plus Add to Home Screen | free | about 10 minutes |
| Google Play | 25 USD once, plus 14 day test period | one to three weeks |
| App Store | 99 USD a year | one to two weeks, with rejection risk |

---

# Editing the content

Facts live in three arrays inside `index.html`: `FACTS_1`, `FACTS_2`, `FACTS_3`. One entry looks like this:

```js
{id:"caffeine-half-life", c:"caffeine",
 t:"Half of a 3pm coffee is still in you at 8pm.",
 w:"Caffeine takes about 5 hours to drop by half...",
 a:["Stop 8 hours before bed...", "..."]}
```

- `id` is permanent. Saved pages and the day-by-day record both point at it. Renaming one silently breaks somebody's saved list.
- `c` is the narrow tag. It picks the character and maps to a broad category through `CAT_OF`. Any new tag must be added there or the page falls back to "curious body".
- `t` is the headline, `w` the reason, `a` the optional steps.

Adding facts is safe at any time. Days already shown are recorded, so existing readers keep their history and new facts simply join the unseen pool.

Illustrations are chosen in `artFor()`: a bespoke drawing from `ART` if the fact has an `art` key, otherwise a picture spec from `SCENES`, otherwise the subject's character from `MASCOT`.
