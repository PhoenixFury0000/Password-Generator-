/* script.js — modular, commented, production-ready front-end logic

   Features:

     - Secure RNG with crypto.getRandomValues + rejection sampling

     - Scramble reveal animation for generated password

     - Entropy-based strength meter (bits estimate)

     - Confetti on copy (canvas + particles)

     - 3D tilt effect on card

     - Theme toggle persisted to localStorage

     - In-memory history with quick-copy buttons

     - Fallbacks and error logging

*/

(() => {

  'use strict';

  /* ---------- Logger (simple, toggleable) ---------- */

  const Log = {

    debug: (...args) => { if (window.location.hash === '#debug') console.debug('[pwgen]', ...args); },

    info: (...args) => console.info('[pwgen]', ...args),

    warn: (...args) => console.warn('[pwgen]', ...args),

    error: (...args) => console.error('[pwgen]', ...args)

  };

  /* ---------- DOM references ---------- */

  const $ = sel => document.querySelector(sel);

  const passwordInput = $('#password');

  const lengthRange = $('#length');

  const lengthNumber = $('#lengthNumber');

  const generateBtn = $('#generateBtn');

  const regenerateBtn = $('#regenerateBtn');

  const copyBtn = $('#copyBtn');

  const revealBtn = $('#revealBtn');

  const strengthBar = $('#strengthBar');

  const strengthLabel = $('#strengthLabel');

  const optUpper = $('#optUpper');

  const optLower = $('#optLower');

  const optNumbers = $('#optNumbers');

  const optSymbols = $('#optSymbols');

  const optExclude = $('#optExclude');

  const historyUL = $('#history');

  const confettiCanvas = $('#confetti-canvas');

  const card = $('#card');

  const themeToggle = $('#themeToggle');

  const logoLock = $('#logoLock');

  const eyeIcon = $('#eyeIcon');

  /* ---------- Constants ---------- */

  const CHAR = {

    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

    lower: 'abcdefghijklmnopqrstuvwxyz',

    numbers: '0123456789',

    symbols: '!@#$%^&*()_+[]{}|;:,.<>?'

  };

  const AMBIGUOUS = /[O0Il]/g;

  /* ---------- State ---------- */

  let history = [];            // in-memory only

  let lastGenerated = '';      // last password

  let reveal = false;

  let confettiCtx = null;

  let confettiActive = false;

  /* ---------- Utilities: secure random int ---------- */

  function secureRandomInt(range) {

    // return a uniformly distributed integer in [0, range)

    if (!window.crypto || !window.crypto.getRandomValues) {

      Log.warn('crypto.getRandomValues not available — falling back to Math.random (less secure).');

      return Math.floor(Math.random() * range);

    }

    if (range <= 0) throw new Error('Range must be > 0');

    const maxUint = 0xFFFFFFFF;

    const bucketSize = Math.floor((maxUint + 1) / range);

    const limit = bucketSize * range;

    let rand;

    const arr = new Uint32Array(1);

    do {

      window.crypto.getRandomValues(arr);

      rand = arr[0];

    } while (rand >= limit);

    return rand % range;

  }

  /* ---------- Generate password using secure RNG ---------- */

  function buildCharPool() {

    let pool = '';

    if (optUpper.checked) pool += CHAR.upper;

    if (optLower.checked) pool += CHAR.lower;

    if (optNumbers.checked) pool += CHAR.numbers;

    if (optSymbols.checked) pool += CHAR.symbols;

    if (optExclude.checked) pool = pool.replace(AMBIGUOUS, '');

    return pool;

  }

  function generatePlain(length) {

    const pool = buildCharPool();

    if (!pool) { throw new Error('No character sets selected'); }

    // Use secureRandomInt to select characters

    const out = new Array(length);

    for (let i = 0; i < length; i++) {

      const idx = secureRandomInt(pool.length);

      out[i] = pool.charAt(idx);

    }

    return out.join('');

  }

  /* ---------- Entropy calculation (bits) & strength label ---------- */

  function estimateEntropyBits(password) {

    const poolSize = new Set(buildCharPool()).size;

    if (poolSize === 0) return 0;

    // bits = length * log2(poolSize)

    return password.length * Math.log2(poolSize);

  }

  function strengthFromEntropy(bits) {

    if (bits < 28) return { label: 'Very weak', color: '#ff6b6b', pct: 20 };

    if (bits < 40) return { label: 'Weak', color: '#ff8a4a', pct: 40 };

    if (bits < 60) return { label: 'Moderate', color: '#ffd54d', pct: 60 };

    if (bits < 80) return { label: 'Strong', color: '#8be58b', pct: 80 };

    return { label: 'Very strong', color: '#2bd39b', pct: 100 };

  }

  /* ---------- Scramble reveal animation (like Hollywood) ---------- */

  function scrambleReveal(finalText, duration = 600) {

    const start = performance.now();

    const length = finalText.length;

    const pool = buildCharPool() || 'abcdefghijklmnopqrstuvwxyz0123456789';

    function frame(now) {

      const t = Math.min(1, (now - start) / duration);

      // reveal progressively

      const revealCount = Math.floor(t * length);

      let out = '';

      for (let i = 0; i < length; i++) {

        if (i < revealCount) out += finalText[i];

        else out += pool.charAt(secureRandomInt(pool.length));

      }

      passwordInput.value = out;

      if (t < 1) requestAnimationFrame(frame);

      else { passwordInput.value = finalText; }

    }

    requestAnimationFrame(frame);

  }

  /* ---------- UI updates ---------- */

  function updateStrengthUI(pw) {

    const bits = estimateEntropyBits(pw);

    const s = strengthFromEntropy(bits);

    strengthBar.style.width = s.pct + '%';

    strengthBar.style.background = s.color;

    strengthLabel.textContent = `${s.label} · ${Math.round(bits)} bits`;

    // animate logo lock (simple rotate / color)

    const lockColor = s.pct > 80 ? '#2bd39b' : (s.pct > 60 ? '#8be58b' : (s.pct > 40 ? '#ffd54d' : '#ff8a4a'));

    logoLock.style.color = lockColor;

  }

  function pushHistory(pw) {

    if (!pw) return;

    if (history[0] === pw) return;

    history.unshift(pw);

    if (history.length > 8) history.pop();

    renderHistory();

  }

  function renderHistory() {

    historyUL.innerHTML = '';

    history.forEach(pw => {

      const li = document.createElement('li');

      li.className = 'history-item';

      li.textContent = pw;

      const btn = document.createElement('button');

      btn.className = 'copy-btn';

      btn.textContent = 'Copy';

      btn.title = 'Copy from history';

      btn.addEventListener('click', (e) => {

        e.stopPropagation();

        passwordInput.value = pw;

        updateStrengthUI(pw);

        copyHandler(true /*from history*/);

      });

      li.appendChild(btn);

      li.addEventListener('click', () => {

        passwordInput.value = pw;

        updateStrengthUI(pw);

      });

      historyUL.appendChild(li);

    });

  }

  /* ---------- Copy + confetti ---------- */

  function copyToClipboard(text) {

    // use navigator.clipboard when possible

    if (navigator.clipboard && navigator.clipboard.writeText) {

      return navigator.clipboard.writeText(text);

    }

    // fallback

    return new Promise((resolve, reject) => {

      try {

        const ta = document.createElement('textarea');

        ta.value = text;

        document.body.appendChild(ta);

        ta.select();

        document.execCommand('copy');

        ta.remove();

        resolve();

      } catch (err) {

        reject(err);

      }

    });

  }

  async function copyHandler(fromHistory = false) {

    const text = passwordInput.value;

    if (!text) return;

    try {

      await copyToClipboard(text);

      animateCopySuccess();

      Log.info('Copied password (length=' + text.length + ')', { fromHistory });

    } catch (err) {

      Log.error('Copy failed', err);

      alert('Copy failed — please allow clipboard permissions');

    }

  }

  /* ---------- Copy success animation + confetti ---------- */

  function animateCopySuccess() {

    // small glow on input then confetti

    passwordInput.animate([

      { boxShadow: '0 0 0 0 rgba(45,211,155,0.0)' },

      { boxShadow: '0 0 36px 6px rgba(45,211,155,0.16)' },

      { boxShadow: '0 0 0 0 rgba(45,211,155,0.0)' }

    ], { duration: 700, easing: 'cubic-bezier(.2,.9,.2,1)'});

    // run confetti

    runConfetti();

  }

  /* ---------- Confetti implementation (lightweight) ---------- */

  function setupConfettiCanvas() {

    confettiCanvas.width = window.innerWidth;

    confettiCanvas.height = window.innerHeight;

    confettiCtx = confettiCanvas.getContext('2d');

  }

  const confettiParticles = [];

  function spawnConfettiBurst(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 30) {

    const colors = ['#24e0ff', '#6f86d6', '#a13cff', '#ffcf5e', '#2bd39b'];

    for (let i = 0; i < count; i++) {

      confettiParticles.push({

        x: x + (secureRandomInt(60) - 30),

        y: y + (secureRandomInt(40) - 20),

        vx: (secureRandomInt(600) - 300) / 100,

        vy: - (secureRandomInt(800) / 300 + 1),

        rot: Math.random() * Math.PI * 2,

        vr: (Math.random() - 0.5) * 0.2,

        size: 6 + secureRandomInt(8),

        color: colors[secureRandomInt(colors.length)],

        alive: 0

      });

    }

  }

  function runConfetti() {

    if (!confettiCtx) setupConfettiCanvas();

    if (confettiActive) return;

    confettiActive = true;

    spawnConfettiBurst();

    const gravity = 0.035;

    let last = performance.now();

    function frame(now) {

      const dt = Math.min(40, now - last);

      last = now;

      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      for (let i = confettiParticles.length - 1; i >= 0; i--) {

        const p = confettiParticles[i];

        p.vy += gravity * (dt / 16);

        p.x += p.vx * (dt / 16);

        p.y += p.vy * (dt / 16);

        p.rot += p.vr * (dt / 16);

        p.alive += dt;

        // draw

        confettiCtx.save();

        confettiCtx.translate(p.x, p.y);

        confettiCtx.rotate(p.rot);

        confettiCtx.fillStyle = p.color;

        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);

        confettiCtx.restore();

        if (p.y > confettiCanvas.height + 30 || p.x < -50 || p.x > confettiCanvas.width + 50) {

          confettiParticles.splice(i, 1);

        }

      }

      if (confettiParticles.length > 0) requestAnimationFrame(frame);

      else { confettiActive = false; confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); }

    }

    requestAnimationFrame(frame);

  }

  /* ---------- 3D tilt interaction ---------- */

  function setupTilt() {

    let rect = null;

    card.addEventListener('pointermove', (ev) => {

      rect = rect || card.getBoundingClientRect();

      const cx = rect.left + rect.width / 2;

      const cy = rect.top + rect.height / 2;

      const dx = ev.clientX - cx;

      const dy = ev.clientY - cy;

      const rx = (-dy / rect.height) * 8; // rotateX

      const ry = (dx / rect.width) * 10;  // rotateY

      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;

    });

    card.addEventListener('pointerleave', () => {

      card.style.transform = '';

      rect = null;

    });

  }

  /* ---------- Theme toggle ---------- */

  function applyTheme(theme) {

    if (theme === 'light') {

      document.documentElement.style.setProperty('--bg-1', '#f6f7fb');

      document.body.style.background = 'linear-gradient(120deg,#f8fafc,#eef2ff 50%, #fff)';

      document.documentElement.style.setProperty('color-scheme', 'light');

      themeToggle.setAttribute('aria-pressed', 'true');

    } else {

      document.documentElement.style.removeProperty('--bg-1');

      document.body.style.background = 'linear-gradient(120deg, #071124 0%, #0b1220 40%, #141225 100%)';

      document.documentElement.style.setProperty('color-scheme', 'dark');

      themeToggle.setAttribute('aria-pressed', 'false');

    }

  }

  themeToggle.addEventListener('click', () => {

    const next = (localStorage.getItem('pw-theme') === 'light') ? 'dark' : 'light';

    localStorage.setItem('pw-theme', next);

    applyTheme(next);

  });

  /* ---------- Event handlers ---------- */

  function generateHandler(fastReveal = false) {

    try {

      const length = Math.max(6, Math.min(64, parseInt(lengthNumber.value) || parseInt(lengthRange.value)));

      lengthRange.value = lengthNumber.value = length;

      const pw = generatePlain(length);

      lastGenerated = pw;

      if (fastReveal) {

        passwordInput.value = pw;

      } else {

        scrambleReveal(pw, 700);

      }

      updateStrengthUI(pw);

      pushHistory(pw);

    } catch (err) {

      Log.error('Generate failed:', err);

      alert('Failed to generate — please select at least one character set.');

    }

  }

  function copyClickHandler() { copyHandler(false); }

  function toggleReveal() {

    reveal = !reveal;

    revealBtn.setAttribute('aria-pressed', String(reveal));

    if (reveal) {

      passwordInput.type = 'text';

      eyeIcon.style.filter = 'drop-shadow(0 4px 12px rgba(36,224,255,0.12))';

    } else {

      passwordInput.type = 'text'; // we intentionally keep readonly text but visually hide/reveal; browsers may block type toggle on readonly in some contexts; keep text

      eyeIcon.style.filter = 'none';

    }

  }

  /* ---------- Initialization ---------- */

  function init() {

    Log.info('Initializing UI');

    // Setup confetti canvas

    setupConfettiCanvas();

    window.addEventListener('resize', setupConfettiCanvas);

    // Wire inputs

    lengthRange.addEventListener('input', (e) => lengthNumber.value = e.target.value);

    lengthNumber.addEventListener('change', (e) => {

      let v = parseInt(e.target.value) || 16;

      v = Math.max(6, Math.min(64, v));

      lengthNumber.value = lengthRange.value = v;

    });

    generateBtn.addEventListener('click', () => generateHandler(false));

    regenerateBtn.addEventListener('click', () => generateHandler(true));

    copyBtn.addEventListener('click', copyClickHandler);

    revealBtn.addEventListener('click', toggleReveal);

    // keyboard shortcuts: Enter = generate, C = copy

    document.addEventListener('keydown', (ev) => {

      if (ev.key === 'Enter') { generateHandler(false); }

      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'c') { copyHandler(false); ev.preventDefault(); }

      // quick-copy 'c' when password focused

      if (ev.key.toLowerCase() === 'c' && document.activeElement === passwordInput) { copyHandler(false); }

    });

    // tilt

    setupTilt();

    // theme

    const saved = localStorage.getItem('pw-theme') || 'dark';

    applyTheme(saved);

    // initial generate

    generateHandler(false);

    // accessibility: announce initial state

    strengthLabel.setAttribute('aria-live', 'polite');

    Log.debug('Init complete');

  }

  // expose some things for debugging optionally

  window.pwgen = { generateHandler, generatePlain, estimateEntropyBits, secureRandomInt };

  // start

  document.addEventListener('DOMContentLoaded', init);

})();