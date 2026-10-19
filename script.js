(function () {
  'use strict';
  const E = window.GameEngine, app = document.getElementById('app');
  const dialog = document.getElementById('confirm-dialog');
  const HISTORY_KEY = 'imposter.history.v1', SESSION_KEY = 'imposter.active.v1';
  const esc = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const icon = type => {
    const paths = {
      mask: '<path d="M5 12c7 0 9 3 15 3s8-3 15-3v10c0 7-8 11-15 5C13 33 5 29 5 22Z"/><path d="m10 19 6 2m8 0 6-2"/>',
      question: '<rect x="7" y="5" width="26" height="28" rx="6"/><path d="M16 15a4 4 0 0 1 8 0c0 3-4 3-4 6m0 5h.01"/>',
      lock: '<rect x="11" y="18" width="18" height="15" rx="3"/><path d="M15 18v-5a5 5 0 0 1 10 0v5m-5 6v3"/>',
      star: '<path d="m20 4 4 11 12 5-12 4-4 12-4-12-12-4 12-5Z"/>',
      person: '<circle cx="20" cy="13" r="6"/><path d="M8 33v-4a12 12 0 0 1 24 0v4"/>'
    };
    return '<svg viewBox="0 0 40 40" aria-hidden="true">' + paths[type] + '</svg>';
  };
  function read(storage, key) { try { return JSON.parse(window[storage].getItem(key)); } catch (_) { return null; } }
  function write(storage, key, value) { try { if (value === null) window[storage].removeItem(key); else window[storage].setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } }
  let historyData = E.cleanHistory(read('localStorage', HISTORY_KEY));
  let config = { mode: 'classic', players: '', imposters: 1, categories: [] };
  let round = null, screen = 'home', activeCard = null, ignoreUntil = 0, dialogKind = 'results';
  const modeName = () => config.mode === 'classic' ? 'CLASSIC IMPOSTER' : 'QUESTION IMPOSTER';
  function mount(html, name) {
    screen = name; app.innerHTML = html; app.className = 'screen screen-' + name;
    window.scrollTo(0, 0);
    const h = app.querySelector('h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  }
  function back(label = 'Back') { return '<button class="back" data-action="back" aria-label="' + label + '">←</button>'; }
  function top(label, sub = '') { return '<div class="screen-top">' + back() + '<span class="eyebrow">' + label + '</span><span class="top-meta">' + sub + '</span></div>'; }
  function saveActive() {
    // Store settings only. Never persist private assignments or a reveal screen.
    write('sessionStorage', SESSION_KEY, round ? { config, active: true } : null);
  }
  function home() {
    round = null; activeCard = null; saveActive(); closeDialog();
    window.history.replaceState({ screen: 'home' }, '');
    mount('<section class="home-intro"><div class="eyebrow intro-tag"><span></span> TRUST NO ONE <span></span></div><h1 class="hero-title">IMPOSTER<span>.</span></h1><p class="tagline">One of you is lying.</p><div class="hero-line"></div></section><div class="choose-label"><span>CHOOSE YOUR GAME</span><span>01 — 02</span></div><div class="mode-grid"><button class="mode-card" data-mode="classic"><div class="mode-art classic-art">' + icon('mask') + '<span class="art-orbit"></span></div><div class="mode-content"><div class="card-kicker">THE ORIGINAL <span>01</span></div><h2>CLASSIC<br>IMPOSTER</h2><p>Everyone knows the word.<br>Except the Imposters.</p><div class="card-bottom"><span>3–25 PLAYERS</span><span class="circle-arrow">↗</span></div></div></button><button class="mode-card" data-mode="question"><div class="mode-art question-art">' + icon('question') + '<span class="art-orbit"></span></div><div class="mode-content"><div class="card-kicker">A DIFFERENT KIND OF DECEPTION <span>02</span></div><h2>QUESTION<br>IMPOSTER</h2><p>Everyone gets a question.<br>One is different.</p><div class="card-bottom"><span>3–25 PLAYERS</span><span class="circle-arrow">↗</span></div></div></button></div><p class="home-note">Gather your friends. Pass the phone. Find the fake.</p>', 'home');
  }
  function setup(mode) {
    config.mode = mode; config.imposters = E.validPlayers(config.players) ? E.recommended(+config.players) : 1;
    mount(top(modeName(), 'SETUP') + '<section class="narrow"><span class="step-label">GET THE GROUP TOGETHER</span><h1>How many people<br>are playing<span class="gold">?</span></h1><p class="muted">One phone is all you need. Bring 3–25 players.</p><form id="setup-form" novalidate><label class="input-label" for="players">NUMBER OF PLAYERS</label><input id="players" name="players" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" autocomplete="off" placeholder="Enter number of players" value="' + esc(config.players) + '" aria-describedby="player-error" required><p class="error" id="player-error" role="alert"></p><div class="imposter-setting"><div><span class="input-label">IMPOSTERS</span><p id="recommendation">' + (mode === 'classic' ? 'Recommended for your group' : 'One different question. No one knows who.') + '</p></div><div class="stepper">' + (mode === 'classic' ? '<button type="button" id="minus" aria-label="Fewer Imposters">−</button>' : '') + '<output id="imposter-count">1</output>' + (mode === 'classic' ? '<button type="button" id="plus" aria-label="More Imposters">+</button>' : '') + '</div></div>' + (mode === 'classic' ? '<details class="category-picker"><summary><div><span class="input-label">CATEGORIES</span><span id="category-summary">All categories</span></div><span class="chevron">⌄</span></summary><div class="category-options"><label class="category-option all-option"><input id="all-categories" type="checkbox" ' + (!config.categories.length ? 'checked' : '') + '><span>All categories</span><small>' + E.categories.length + '</small></label>' + E.categories.map(c => '<label class="category-option"><input type="checkbox" name="category" value="' + esc(c) + '" ' + (config.categories.includes(c) ? 'checked' : '') + '><span>' + esc(c) + '</span></label>').join('') + '</div></details>' : '') + '<button class="primary" type="submit">START GAME <span aria-hidden="true">↗</span></button><p class="form-note">' + icon('lock') + ' Your card is for your eyes only.</p></form></section>', 'setup');
    updateSettings();
  }
  function updateSettings() {
    const valid = E.validPlayers(config.players);
    document.getElementById('imposter-count').textContent = config.mode === 'question' ? '1' : config.imposters;
    if (config.mode === 'classic') {
      document.getElementById('minus').disabled = !valid || config.imposters <= 1;
      document.getElementById('plus').disabled = !valid || config.imposters >= +config.players - 2;
      document.getElementById('recommendation').textContent = valid ? E.recommended(+config.players) + ' recommended · keep at least 2 regular players' : 'Automatically recommended for your group';
      document.getElementById('category-summary').textContent = config.categories.length ? config.categories.length + ' selected' : 'All categories';
    }
  }
  function startRound() {
    try { round = E.newRound({ ...config, roundNumber: round ? round.number + 1 : 1 }, historyData); }
    catch (e) { const err = document.getElementById('player-error'); if (err) { err.textContent = e.message; document.getElementById('players').setAttribute('aria-invalid', 'true'); document.getElementById('players').focus(); } return; }
    write('localStorage', HISTORY_KEY, historyData); saveActive(); activeCard = null; grid();
  }
  function grid() {
    activeCard = null;
    if (round.viewed.every(Boolean)) { ready(); return; }
    const count = round.viewed.filter(Boolean).length;
    mount(top(modeName(), 'ROUND ' + String(round.number).padStart(2, '0')) + '<div class="round-heading"><div><span class="step-label">PASS THE PHONE</span><h1>Keep it to yourself<span class="gold">.</span></h1><p class="muted">Choose your number. Remember your card. Pass it on.</p></div><span class="progress-count">' + count + '<span> / ' + round.players + ' viewed</span></span></div><div class="progress-track"><div style="width:' + count / round.players * 100 + '%"></div></div><div class="player-grid">' + round.viewed.map((seen, i) => '<button class="player-card ' + (seen ? 'viewed' : '') + '" data-player="' + i + '" ' + (seen ? 'disabled' : '') + ' aria-label="Person ' + (i + 1) + (seen ? ', viewed and locked' : ', reveal your card') + '"><span class="player-number">' + String(i + 1).padStart(2, '0') + '</span><span class="player-name">PERSON ' + (i + 1) + '</span><span class="player-status">' + (seen ? icon('lock') + ' VIEWED' : 'TAP TO REVEAL <span aria-hidden="true">↗</span>') + '</span></button>').join('') + '</div><p class="privacy-note">' + icon('lock') + ' Once you leave your card, it locks for the round.</p>', 'grid');
  }
  function reveal(index) {
    if (!round || screen !== 'grid' || !Number.isInteger(index) || index < 0 || index >= round.players || round.viewed[index] || Date.now() < ignoreUntil) return;
    activeCard = index; round.viewed[index] = true;
    const isImposter = round.imposters.includes(index), c = round.content;
    window.history.pushState({ private: true }, '');
    const assignment = round.mode === 'classic'
      ? '<div class="category-reveal"><span class="input-label">CATEGORY</span><span>' + esc(c.category) + '</span></div>' + (isImposter ? '<span class="role-label">YOU ARE THE IMPOSTER</span>' : '') + '<span class="input-label">' + (isImposter ? 'YOUR HINT' : 'YOUR WORD') + '</span><div class="secret-word">' + esc(isImposter ? c.hint : c.word) + '</div><p class="muted">' + (isImposter ? 'Blend in. Listen closely. Make it believable.' : 'Keep the word secret. Give a clue when it’s your turn.') + '</p>'
      : '<span class="input-label">YOUR QUESTION</span><div class="secret-question">“' + esc(isImposter ? c.alternate : c.original) + '”</div><p class="muted">Think of your answer. Keep the question to yourself.</p>';
    mount('<div class="screen-top">' + back('Hide and lock your card') + '<span class="eyebrow">FOR YOUR EYES ONLY</span><span></span></div><section class="private-card"><div class="private-top">' + icon('lock') + '<h1>PERSON ' + (index + 1) + '</h1><span class="private-rule"></span></div>' + assignment + '</section><button class="primary narrow-button" data-action="hide">HIDE MY CARD <span aria-hidden="true">←</span></button><p class="privacy-note">Use the gold arrow to lock your card before passing the phone.</p>', 'reveal');
    ignoreUntil = Date.now() + 250;
  }
  function hideCard(fromHistory = false) {
    if (activeCard === null || !round) return;
    activeCard = null; ignoreUntil = Date.now() + 350;
    // Replace the private history entry; back/forward can never reconstruct a reveal.
    if (!fromHistory) window.history.replaceState({ screen: 'grid' }, '');
    grid();
  }
  function ready() {
    mount(top(modeName(), 'ROUND ' + String(round.number).padStart(2, '0')) + '<section class="center-screen"><div class="emblem">' + icon('star') + '</div><span class="eyebrow">LET THE SUSPICIONS BEGIN</span><h1>Everyone is<br>ready<span class="gold">!</span></h1><p class="muted">All cards are locked. Put your poker face on.</p><div class="starter"><span class="input-label">BREAK THE SILENCE</span><strong>PERSON ' + (round.starter + 1) + ' GOES FIRST!</strong></div><p class="discussion-note">' + (round.mode === 'classic' ? 'Take turns giving a clue to your word. Discuss, then vote for the Imposter.' : 'Take turns answering your question aloud. Discuss, then vote for the odd one out.') + '</p><button class="primary" data-action="results">REVEAL RESULTS <span aria-hidden="true">↗</span></button><p class="form-note">Only reveal after everyone has made their guess.</p></section>', 'ready');
  }
  function closeDialog() { if (dialog.open) dialog.close(); }
  function showConfirm(kind) {
    dialogKind = kind;
    const end = kind === 'end';
    dialog.querySelector('.eyebrow').textContent = end ? 'LEAVE THIS ROUND' : 'THE MOMENT OF TRUTH';
    document.getElementById('dialog-title').textContent = end ? 'End this round?' : 'Ready to reveal?';
    dialog.querySelector('p').textContent = end ? 'Your current cards will be discarded. You can choose a new game from the home screen.' : 'Make your final guesses first. This will reveal the Imposter and everyone’s assignment.';
    const confirmButton = document.getElementById('confirm-yes');
    confirmButton.innerHTML = (end ? 'END ROUND' : 'REVEAL RESULTS') + ' <span aria-hidden="true">↗</span>';
    document.getElementById('confirm-no').textContent = end ? 'KEEP PLAYING' : 'KEEP DISCUSSING';
    confirmButton.disabled = true; dialog.showModal(); document.getElementById('confirm-no').focus();
    setTimeout(() => { confirmButton.disabled = false; }, 500);
  }
  function results() {
    if (!round || !round.viewed.every(Boolean) || screen !== 'ready') return;
    closeDialog(); const c = round.content;
    mount('<div class="screen-top"><span class="eyebrow">' + modeName() + '</span><span class="top-meta">ROUND ' + String(round.number).padStart(2, '0') + '</span></div><section class="center-screen results"><div class="emblem">' + icon('mask') + '</div><span class="eyebrow">THE TRUTH IS OUT</span><h1>The Imposter' + (round.imposters.length > 1 ? 's were' : ' was') + '…</h1><div class="suspects">' + round.imposters.map(i => '<span>PERSON ' + (i + 1) + '</span>').join('') + '</div><div class="result-detail">' + (round.mode === 'classic' ? '<div><span class="input-label">CATEGORY</span><p>' + esc(c.category) + '</p></div><div><span class="input-label">SECRET WORD</span><p class="result-word">' + esc(c.word) + '</p></div><div><span class="input-label">IMPOSTER HINT</span><p>' + esc(c.hint) + '</p></div>' : '<div><span class="input-label">ORIGINAL QUESTION</span><p>' + esc(c.original) + '</p></div><div><span class="input-label">IMPOSTER QUESTION</span><p>' + esc(c.alternate) + '</p></div>') + '</div><button class="primary" data-action="again">PLAY AGAIN <span aria-hidden="true">↻</span></button><button class="text-button" data-action="home">CHANGE GAME MODE</button></section>', 'results');
    saveActive();
  }
  function restartPrompt(saved) {
    const s = saved.config;
    if (!s || !['classic', 'question'].includes(s.mode) || !E.validPlayers(s.players)) { home(); return; }
    config = { mode: s.mode, players: s.players, imposters: Math.max(1, Math.min(+s.players - 2, Number.isInteger(s.imposters) ? s.imposters : E.recommended(+s.players))), categories: E.normalizeCategories(s.categories) };
    mount('<section class="center-screen"><div class="emblem">' + icon('lock') + '</div><span class="eyebrow">YOUR SECRETS STAY SECRET</span><h1>A fresh start<span class="gold">.</span></h1><p class="muted">The page was reloaded during a game. To protect everyone’s cards, restart with new assignments.</p><p class="discussion-note">' + modeName() + ' · ' + config.players + ' players<br>Your settings and content history are kept where browser storage is available.</p><button class="primary" data-action="restart">RESTART ROUND <span aria-hidden="true">↻</span></button><button class="text-button" data-action="home">CHANGE GAME MODE</button></section>', 'restart');
  }
  app.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled || Date.now() < ignoreUntil) return;
    if (button.dataset.mode) { setup(button.dataset.mode); return; }
    if (button.dataset.player !== undefined) { reveal(+button.dataset.player); return; }
    const action = button.dataset.action;
    if (action === 'hide' || (action === 'back' && screen === 'reveal')) hideCard();
    else if (action === 'back') {
      if (screen === 'setup') home();
      else if (round) showConfirm('end');
    }
    else if (action === 'home') home();
    else if (action === 'again' || action === 'restart') startRound();
    else if (action === 'results' && screen === 'ready') showConfirm('results');
    else if (button.id === 'minus' || button.id === 'plus') { config.imposters += button.id === 'plus' ? 1 : -1; updateSettings(); }
  });
  app.addEventListener('input', event => {
    if (event.target.id !== 'players') return;
    config.players = event.target.value;
    config.imposters = E.validPlayers(config.players) ? E.recommended(+config.players) : 1;
    document.getElementById('player-error').textContent = '';
    event.target.removeAttribute('aria-invalid'); updateSettings();
  });
  app.addEventListener('change', event => {
    if (event.target.id === 'all-categories') {
      config.categories = []; app.querySelectorAll('[name="category"]').forEach(el => el.checked = false); event.target.checked = true;
    } else if (event.target.name === 'category') {
      config.categories = [...app.querySelectorAll('[name="category"]:checked')].map(el => el.value);
      if (config.categories.length === E.categories.length) { config.categories = []; app.querySelectorAll('[name="category"]').forEach(el => el.checked = false); }
      document.getElementById('all-categories').checked = !config.categories.length;
    } else return;
    updateSettings();
  });
  app.addEventListener('submit', event => { if (event.target.id === 'setup-form') { event.preventDefault(); startRound(); } });
  document.getElementById('confirm-yes').addEventListener('click', () => { if (dialogKind === 'end') home(); else results(); });
  document.getElementById('confirm-no').addEventListener('click', closeDialog);
  document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); if (screen === 'reveal') hideCard(); else if (!round || screen === 'results') home(); else showConfirm('end'); });
  window.addEventListener('popstate', () => { closeDialog(); if (screen === 'reveal') hideCard(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && screen === 'reveal') hideCard(); if (document.hidden) closeDialog(); });
  window.addEventListener('pagehide', () => { if (screen === 'reveal') hideCard(); });
  window.addEventListener('pageshow', event => { if (event.persisted && screen === 'reveal') hideCard(); });
  const saved = read('sessionStorage', SESSION_KEY);
  window.history.replaceState({ screen: 'safe' }, '');
  if (saved && saved.active) restartPrompt(saved); else home();
})();
