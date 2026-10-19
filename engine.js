/* Pure game rules. No network, frameworks, or build step. */
(function (root) {
  'use strict';
  const words = root.CLASSIC_WORDS;
  const pairs = root.QUESTION_PAIRS;
  const categories = [...new Set(words.map(x => x.category))];
  // Preserve saved selections and recent-category history after editorial renames.
  const categoryAliases = {
    'Card Games': 'Cards & Party Games', 'Cars': 'Cars & Vehicles',
    'Casino & Gambling Games': 'Casino & Gambling',
    'Social Media': 'Apps & Social Media', 'Restaurants': 'Restaurants & Dining'
  };
  const wordAliases = {
    '911': 'porsche 911', 'x': 'x (twitter)', 'war': 'war (card game)',
    'hearts': 'hearts (card game)', 'vision': 'vision (marvel)',
    'storm': 'storm (x-men)', 'sunniness': 'sunshine',
    'pinata': 'piñata', 'home room': 'homeroom',
    'distracted boyfriend': 'distracted boyfriend meme',
    'woman yelling at a cat': 'woman yelling at a cat meme'
  };
  function normalizeCategories(values) {
    return Array.isArray(values) ? [...new Set(values.map(c => categoryAliases[c] || c).filter(c => categories.includes(c)))] : [];
  }
  const wordKeys = new Set(words.map(x => x.word.toLowerCase()));
  const pairKeys = new Set(pairs.map(x => x.id));
  function random() {
    if (root.crypto && root.crypto.getRandomValues) {
      const n = new Uint32Array(1); root.crypto.getRandomValues(n); return n[0] / 4294967296;
    }
    return Math.random();
  }
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  function validPlayers(value) { return /^\d+$/.test(String(value)) && +value >= 3 && +value <= 25; }
  function recommended(n) { return n <= 6 ? 1 : n <= 11 ? 2 : n <= 16 ? 3 : n <= 21 ? 4 : 5; }
  function cleanHistory(raw) {
    const h = { words: [], pairs: [], recent: [], assignments: {} };
    if (!raw || typeof raw !== 'object') return h;
    h.words = Array.isArray(raw.words) ? [...new Set(raw.words.map(x => wordAliases[x] || x).filter(x => wordKeys.has(x)))] : [];
    h.pairs = Array.isArray(raw.pairs) ? [...new Set(raw.pairs.filter(x => pairKeys.has(x)))] : [];
    h.recent = Array.isArray(raw.recent) ? raw.recent.map(x => categoryAliases[x] || x).filter(x => categories.includes(x)).slice(-5) : [];
    if (raw.assignments && typeof raw.assignments === 'object') {
      for (const [key, val] of Object.entries(raw.assignments)) {
        if (!/^(classic|question):(\d+)$/.test(key) || !val) continue;
        const n = +key.split(':')[1];
        if (!validPlayers(n) || !Array.isArray(val.counts) || val.counts.length !== n) continue;
        h.assignments[key] = {
          counts: val.counts.map(x => Number.isSafeInteger(x) && x >= 0 ? x : 0),
          last: Array.isArray(val.last) ? val.last.filter(x => Number.isInteger(x) && x >= 0 && x < n) : []
        };
      }
    }
    return h;
  }
  function selectWord(selected, h, rng) {
    const eligibleCategories = selected.length ? selected : categories;
    const pool = words.filter(x => eligibleCategories.includes(x.category));
    if (!pool.length) throw new Error('Select an available category.');
    let used = new Set(h.words);
    let available = pool.filter(x => !used.has(x.word.toLowerCase()));
    if (!available.length) {
      pool.forEach(x => used.delete(x.word.toLowerCase()));
      h.words = [...used]; available = pool;
    }
    const availableCategories = [...new Set(available.map(x => x.category))];
    let choices = availableCategories.filter(x => !h.recent.includes(x));
    if (!choices.length) {
      const last = h.recent[h.recent.length - 1];
      choices = availableCategories.filter(x => x !== last);
      if (!choices.length) choices = availableCategories;
    }
    const category = pick(choices, rng);
    const entry = pick(available.filter(x => x.category === category), rng);
    h.words.push(entry.word.toLowerCase());
    h.recent = [...h.recent, category].slice(-5);
    return entry;
  }
  function selectQuestion(h, rng) {
    const used = new Set(h.pairs);
    let available = pairs.filter(x => !used.has(x.id));
    if (!available.length) { h.pairs = []; available = pairs; }
    const entry = pick(available, rng); h.pairs.push(entry.id); return entry;
  }
  function assign(mode, n, count, h, rng) {
    const key = mode + ':' + n;
    const record = h.assignments[key] || { counts: Array(n).fill(0), last: [] };
    const remaining = Array.from({ length: n }, (_, i) => i);
    const result = [];
    const min = Math.min(...record.counts);
    for (let i = 0; i < count; i++) {
      const weights = remaining.map(p => 1 / (1 + (record.counts[p] - min) * 0.65) * (record.last.includes(p) ? 0.75 : 1));
      let roll = rng() * weights.reduce((a, b) => a + b, 0);
      let index = weights.length - 1;
      for (let j = 0; j < weights.length; j++) { roll -= weights[j]; if (roll < 0) { index = j; break; } }
      const p = remaining.splice(index, 1)[0]; result.push(p); record.counts[p]++;
    }
    record.last = result.slice(); h.assignments[key] = record;
    return result.sort((a, b) => a - b);
  }
  function newRound(config, h, rng = random) {
    const n = Number(config.players);
    if (!validPlayers(config.players)) throw new Error('Enter a whole number from 3 to 25.');
    if (!['classic', 'question'].includes(config.mode)) throw new Error('Choose a game mode.');
    const count = config.mode === 'question' ? 1 : Number(config.imposters);
    if (!Number.isInteger(count) || count < 1 || count > n - 2) throw new Error('Keep at least two regular players.');
    const selected = normalizeCategories(config.categories);
    const content = config.mode === 'classic' ? selectWord(selected, h, rng) : selectQuestion(h, rng);
    return { mode: config.mode, players: n, imposters: assign(config.mode, n, count, h, rng), content, viewed: Array(n).fill(false), starter: Math.floor(rng() * n), number: config.roundNumber || 1 };
  }
  root.GameEngine = { categories, normalizeCategories, validPlayers, recommended, cleanHistory, newRound };
})(typeof window !== 'undefined' ? window : globalThis);
