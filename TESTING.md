# Revision verification

Verified October 19, 2026 against the uploaded original imposter.zip.

## Automated checks

6,964 game/data assertions passed using the actual Classic data, Question data, and game engine in Node's JavaScript VM.

- 1,080 unique Classic words; 45 categories; exactly 24 entries per category.
- Every category generates 24 distinct words before resetting.
- All 1,080 words are reachable without global repetition before the eligible pool resets.
- Category selection and avoidance of recent categories remain functional.
- Every supported group size from 3 to 25 and every valid Classic Imposter count generates distinct, in-range role assignments and fresh cards.
- Single-category and multiple-category restrictions work, including old saved category names.
- Automatic recommended Imposter scaling and invalid-input handling remain intact.
- Existing saved categories, recent-category history, and clarified word labels migrate correctly. Replaced words do not falsely mark their new replacements as played.
- 201 sequential Question rounds exactly match the original engine under identical random seeds, including content, roles, starter, and viewed-card state. The first 200 use distinct question pairs; the next resets the pool.

Separate quality checks passed:

- Every explicitly requested removed word is absent; all seven requested clarified/weather labels exist.
- All 36 specifically requested hint repairs differ from their original hints.
- Every entry has precisely the expected nonempty string fields and a valid category. Words are unique globally, including case-insensitive checks.
- Editorial review covered all 1,080 entries; a full before/after audit is included in CLASSIC-AUDIT.md. Familiarity and hint difficulty remain editorial judgments.
- The Classic selection, Question selection, and role-assignment functions are unchanged from the original.
- index.html, style.css, the Question database, icons, manifest, .nojekyll, and README.md are byte-for-byte unchanged.
- All referenced HTML resources exist. All four runtime JavaScript files pass syntax checks.

## Browser verification

The actual revised site was served locally and tested in the Codex in-app browser.

- Complete three-player Classic flow: selected Cars & Vehicles, opened Person 3 first, confirmed matching regular words, category plus indirect Imposter hint, locked cards, discussion screen, results confirmation, correct results, and Play Again with fresh cards.
- Reload during a subsequent round produced the existing safe restart prompt; no private assignment was reconstructed.
- Complete three-player Question flow: Person 3 first, one alternate and two identical original prompts, no role labels during reveals, locked cards, discussion screen, confirmation, and correct final prompts/results.
- At 375px, the Classic game grid fit the viewport without horizontal overflow.
- At 320px, the homepage, expanded 45-category selector, and 25-player grid fit without horizontal overflow. Automatic scaling displayed five Imposters for 25 players.
- Multiple renamed categories could be selected together. Person 25 opened successfully and showed a selected category.
- No browser warning/error logs were recorded in the verification tab.
- The black-and-gold homepage was visually checked. Its stylesheet and HTML remain identical to the original.

## Limits

Physical iPhone Safari and other device/browser combinations were not individually tested. The site retains its original static HTML/JavaScript architecture, relative paths, manifest, safe-area CSS, and lack of build or backend requirements. GitHub Pages deployment itself has not been performed. Hint balance and familiarity should still be refined from actual group play; borderline terms are identified in the audit.
