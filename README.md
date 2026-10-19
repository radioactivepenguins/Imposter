# IMPOSTER

A complete, mobile-first pass-the-phone party game. Plain HTML, CSS, and JavaScript. No accounts, APIs, backend, build tools, or paid dependencies.

## Play locally on your Mac

1. Unzip the project if you downloaded the ZIP.
2. Keep the `imposter` folder intact.
3. Double-click `index.html`, or right-click it and choose **Open With → Safari** or **Google Chrome**.
4. Choose a mode, type a player count from 3 to 25, and start.

No installation or server is required. All content is included. If your browser restricts storage for local files, gameplay still works; saved content history may not persist.

## How to play

- Everyone picks a Person number. Keep that same number during repeated rounds for fairer role assignment.
- Pass the phone. Each player selects only their numbered card, reads it privately, then taps the gold back arrow or **Hide My Card**.
- Viewed cards lock and all look the same. Cards can be opened in any order.
- **Classic:** regular players share a secret word. Imposters see the category and a related hint. Give clues, discuss, and vote aloud.
- **Question:** everyone sees a question; exactly one person receives the alternate question. Nobody is told their role. Answer aloud without reading your question, then discuss and vote.
- After all cards are viewed, a random player starts. **Reveal Results** asks for confirmation.
- **Play Again** keeps your mode, player count, Imposter setting, and categories, then assigns fresh roles and content.

Classic defaults: 3–6 players → 1 Imposter; 7–11 → 2; 12–16 → 3; 17–21 → 4; 22–25 → 5. You can adjust this while retaining at least two regular players. Question mode always has one Imposter.

## Publish free with GitHub Pages

The project is ready to upload; it has **not been published**. No authenticated GitHub deployment connection was available in this workspace.

1. Sign in at [GitHub](https://github.com/). Choose **+ → New repository**.
2. Name it `imposter`, choose **Public**, enable **Add README**, and create it. Public repositories support Pages on GitHub Free. [GitHub’s repository and Pages instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
3. In the repository, choose **Add file → Upload files**. Drag the **contents** of the local `imposter` folder into the upload area, including the `data` and `icons` folders. Do not upload the ZIP or nest everything inside another `imposter` folder. Commit to `main`. `index.html` must be at the repository’s top level.
4. Open **Settings → Pages**. Under **Build and deployment**, set **Source: Deploy from a branch**, **Branch: main**, and **Folder: /(root)**. Save. [GitHub’s publishing settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
5. Wait for the Pages deployment to complete. In **Settings → Pages**, use **Visit site** and copy the actual HTTPS address. GitHub derives it from your account and repository; no example address is hardcoded in this project.

The hidden `.nojekyll` file is included. If Finder does not show it, press **Command–Shift–.** to show hidden files, or create a file named `.nojekyll` in GitHub with a short comment. The site also uses only ordinary static files.

## Use it on iPhone

1. Open the published HTTPS address in **Safari**. The laptop can now be turned off; GitHub serves the site.
2. Tap **Share → Add to Home Screen**, name it **Imposter**, enable **Open as Web App** if offered, then tap **Add**. If the action is missing, use **Edit Actions** in the share menu. [Apple’s instructions](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios).
3. Open the new icon to play. Installation is optional; Safari works normally too.

Icons, a web manifest, and iPhone safe-area support are included. There is no service worker or offline-install promise. A hosted page needs a connection to load; once loaded, the game makes no network requests for gameplay.

## Update without changing the link

Edit the local files, upload the changed files to the same paths in the same repository, and commit to `main`. Pages republishes the site. Keep the same account, repository name, and Pages source to retain the URL. Refresh Safari after deployment; if it shows old content, close and reopen the home-screen app or reload the page.

## Content and replay variety

- **1,080 unique Classic words**, 45 categories, 24 entries per category.
- **200 question pairs**, 18 themes, with easy/medium/hard editorial difficulty labels.
- All Classic entries have a category, word, and individual hint.
- Categories are selected before words, with recent categories avoided when alternatives exist.
- Used words do not repeat until the selected eligible word pool is exhausted. Changing categories retains history for other pools. Questions repeat only after all 200 are used.
- Weighted random selection favors Person numbers with fewer previous Imposter assignments, without using a fixed rotation. Counts are tracked separately by mode and group size.
- History stays in this browser’s localStorage. Different devices, private browsing, file versus hosted URLs, or cleared website data can have separate histories. Blocked storage falls back to in-memory play.

## Privacy behavior

Cards lock as soon as they open. Dismissal removes the assignment from the page. Browser back/forward cannot recreate a reveal. Switching away from the page hides and locks the current card. Refreshing an active game offers a fresh round with the same settings when sessionStorage is available; private assignments are never saved there. Without storage, reload safely returns home.

This protects against accidental spoilers in ordinary use. As with every browser-only party game, someone deliberately using developer tools can inspect runtime data. It is intended for friends sharing a phone.

## Files

- `index.html` — page shell and confirmation dialog
- `style.css` — responsive black-and-gold design
- `script.js` — screens, input handling, privacy, and persistence
- `engine.js` — validation, content selection, and weighted role assignment
- `data/classicWords.js` — complete Classic content
- `data/questionPairs.js` — complete Question content
- `manifest.webmanifest`, `icons/` — home-screen presentation
- `TESTING.md` — verification results and device-testing limits

## Extend the databases

Add a `{ category, word, hint }` object to `window.CLASSIC_WORDS`. New categories appear automatically. Keep words unique across the full library and hints indirect. Add a question object with a unique stable `id`, `theme`, `difficulty`, `original`, and `alternate` to `window.QUESTION_PAIRS`. Existing question IDs must stay stable so saved history remains meaningful. The difficulty labels are metadata; they are never shown as role cues.
