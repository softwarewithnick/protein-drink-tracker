(function () {
  'use strict';

  const STORAGE_KEY = 'proteinDrinkTracker';
  const THEME_KEY = 'proteinTheme';
  const LANG_KEY = 'proteinTrackerLang';
  const RESET_HOUR = 2; // 2am local
  const HISTORY_MAX_DAYS = 365;

  const WORLD_CITIES = [
    { name: 'New York', timeZone: 'America/New_York' },
    { name: 'London', timeZone: 'Europe/London' },
    { name: 'Tokyo', timeZone: 'Asia/Tokyo' },
    { name: 'Sydney', timeZone: 'Australia/Sydney' },
    { name: 'India', timeZone: 'Asia/Kolkata' }
  ];

  /* --- Location Variables --- */
  let userLocation = { city: 'Local Time', timeZone: undefined };

  // 1. translation dictionary
  const translations = {
    en: {
      title: "Protein Drink Tracker",
      btnDrank: "I drank my protein",
      btnDrankUndo: "Undo",
      statusDone: "Protein done for today.",
      statusNotDone: "Not yet today."
    },
    fr: {
      title: "Suivi de Protéines",
      btnDrank: "J'ai bu ma protéine",
      btnDrankUndo: "Annuler",
      statusDone: "Protéine prise aujourd'hui.",
      statusNotDone: "Pas encore aujourd'hui."
    }
  };

  // Get preferred language (default: en)
  let currentLang = localStorage.getItem(LANG_KEY) || 'en';

  /**
   * App "day" = from 2:00 AM to 1:59 AM next calendar day (local).
   * Returns YYYY-MM-DD for the current app day.
   */
  function getDateKey() {
    const now = new Date();
    const hour = now.getHours();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (hour < RESET_HOUR) {
      date.setDate(date.getDate() - 1);
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function parseDateKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDisplayDate(dateKey) {
    const d = parseDateKey(dateKey);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { dateKey: null, drank: false, drinkTimestamps: [], history: [] };
      const data = JSON.parse(raw);
      const history = Array.isArray(data.history) ? data.history : [];
      const drinkTimestamps = Array.isArray(data.drinkTimestamps) ? data.drinkTimestamps : [];
      return {
        dateKey: data.dateKey || null,
        drank: Boolean(data.drank),
        drinkTimestamps: drinkTimestamps,
        history: history
      };
    } catch (_) {
      return { dateKey: null, drank: false, drinkTimestamps: [], history: [] };
    }
  }

  function saveState(dateKey, drank, history, drinkTimestamps) {
    try {
      const trimmed = (history || []).slice(-HISTORY_MAX_DAYS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dateKey, drank, drinkTimestamps, history: trimmed }));
    } catch (_) { }
  }

  function getCurrentDrank() {
    const dateKey = getDateKey();
    const stored = loadState();
    if (stored.dateKey !== dateKey) {
      return false;
    }
    return stored.drank;
  }

  function getHistory() {
    const dateKey = getDateKey();
    const stored = loadState();
    let history = stored.history || [];
    if (stored.dateKey === dateKey && stored.drank && !history.includes(dateKey)) {
      history = history.concat([dateKey]);
      saveState(dateKey, true, history, stored.drinkTimestamps);
    } else if (stored.dateKey === dateKey && !stored.drank) {
      history = history.filter(function (k) { return k !== dateKey; });
    }
    return history;
  }

  function setDrank(drank) {
    const dateKey = getDateKey();
    const stored = loadState();
    let history = stored.history || [];
    let drinkTimestamps = stored.drinkTimestamps || [];

    if (drank) {
      if (!history.includes(dateKey)) history = history.concat([dateKey]);
      drinkTimestamps = drinkTimestamps.filter(function (ts) { return ts.date !== dateKey; });
      drinkTimestamps = drinkTimestamps.concat([{ date: dateKey, time: new Date().toLocaleTimeString() }]);
    } else {
      history = history.filter(function (k) { return k !== dateKey; });
      drinkTimestamps = drinkTimestamps.filter(function (ts) { return ts.date !== dateKey; });
    }

    saveState(dateKey, drank, history, drinkTimestamps);
  }

  function getStreak() {
    const todayKey = getDateKey();
    const history = getHistory();
    const drankSet = new Set(history);
    if (!drankSet.has(todayKey)) return 0;
    let streak = 0;
    const today = parseDateKey(todayKey);
    let d = new Date(today);
    while (true) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = y + '-' + m + '-' + day;
      if (!drankSet.has(key)) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function toggleDrank() {
    const next = !getCurrentDrank();
    setDrank(next);
    return next;
  }

  /* --- Location Functions --- */
  async function fetchCityName(lat, lon) {
    try {
      // Using BigDataCloud's free reverse geocoding API (client-side capable)
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      if (!res.ok) throw new Error('HTTP Error ' + res.status);

      const data = await res.json();
      if (!data || typeof data !== 'object') throw new Error('Invalid response data');

      return data.city || data.locality || 'Location Found';
    } catch (e) {
      console.error('City fetch failed', e);
      return 'Local Time';
    }
  }

  function initLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        userLocation.city = await fetchCityName(latitude, longitude);
        const el = document.getElementById('main-clock-label');
        if (el) el.textContent = 'Time in ' + userLocation.city;
      }, (err) => {
        console.warn('Geolocation denied or failed', err);
        const el = document.getElementById('main-clock-label');
        if (el) el.textContent = 'Local Time';
      });
    } else {
      const el = document.getElementById('main-clock-label');
      if (el) el.textContent = 'Local Time';
    }
  }

  /* --- Clock Functions --- */
  function initWorldClocks() {
    const container = document.getElementById('world-clocks');
    if (container) {
      let html = '';
      WORLD_CITIES.forEach((city, index) => {
        html += `
          <div class="world-clock-item">
            <span class="city-name">${city.name}</span>
            <span class="city-time" id="world-clock-time-${index}">--:--</span>
          </div>
        `;
      });
      container.innerHTML = html;
    }
  }

  function updateClock() {
    const now = new Date();

    // Main Clock (Local)
    const timeEl = document.getElementById('clock-time');
    const secEl = document.getElementById('clock-seconds');

    if (timeEl && secEl) {
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');

      timeEl.textContent = `${h}:${m}`;
      secEl.textContent = s;
    }

    // World Clocks
    WORLD_CITIES.forEach((city, index) => {
      const el = document.getElementById(`world-clock-time-${index}`);
      if (el) {
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: city.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        el.textContent = timeStr;
      }
    });
  }

  /* --- Theme Functions --- */
  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'light' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  /* --- UI Functions --- */
  function updateUI(drank) {
    const dateKey = getDateKey();
    const stored = loadState();
    const flexed = document.getElementById('arm-flexed');
    const weak = document.getElementById('arm-weak');
    const btn = document.getElementById('toggle-btn');
    const status = document.getElementById('status-text');
    const title = document.querySelector('.logo-text'); // Targeted class selector
    const dateEl = document.getElementById('date-text');
    const streakEl = document.getElementById('streak-text');
    const lastTimeEl = document.getElementById('last-time');

    const texts = translations[currentLang];

    if (title) title.textContent = texts.title;
    if (flexed) flexed.classList.toggle('hidden', !drank);
    if (weak) weak.classList.toggle('hidden', drank);
    if (btn) {
      btn.setAttribute('aria-pressed', drank ? 'true' : 'false');
      btn.textContent = drank ? texts.btnDrankUndo : texts.btnDrank;
    }
    if (status) {
      status.textContent = drank ? texts.statusDone : texts.statusNotDone;
    }
    if (dateEl) {
      dateEl.textContent = formatDisplayDate(dateKey);
    }
    if (streakEl) {
      const streak = getStreak();
      streakEl.textContent = streak > 0
        ? (streak === 1 ? '1 day streak!' : streak + ' day streak!')
        : '';
    }
    if (lastTimeEl) {
      const timestamps = stored.drinkTimestamps || [];
      if (timestamps.length > 0) {
        const recent = timestamps.slice().sort(function (a, b) { return b.date.localeCompare(a.date); })[0];
        const isToday = recent.date === dateKey;
        lastTimeEl.textContent = isToday
          ? `Last drank at: ${recent.time}`
          : `Last drank: ${formatDisplayDate(recent.date)} at ${recent.time}`;
      } else {
        lastTimeEl.textContent = '';
      }
    }
  }

  function celebrate() {
    // 1. Confetti Explosion
    if (typeof confetti === 'function') {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }

    // 2. Small Floating Emojis (Scattered bubbles style)
    const emojis = ['👍', '🙂', '💪', '⭐', '🥤', '🔥'];
    const container = document.body;

    // Create 30 small emojis
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      // Random Positioning and Sizing
      const startLeft = Math.random() * 80 + 10; // 10% to 90%
      const startTop = Math.random() * 30 + 50;  // 50% to 80% vertical (start around middle/bottom)
      const size = Math.random() * 1.5 + 1.5;    // 1.5rem to 3rem (small)
      const duration = Math.random() * 1000 + 1000; // 1s to 2s duration

      Object.assign(el.style, {
        position: 'fixed',
        left: `${startLeft}%`,
        top: `${startTop}%`,
        fontSize: `${size}rem`,
        pointerEvents: 'none',
        zIndex: '9999',
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: '0',
        transition: `all ${duration}ms cubic-bezier(0.19, 1, 0.22, 1)`,
        textShadow: '0 4px 8px rgba(0,0,0,0.2)'
      });

      container.appendChild(el);

      // Animate
      requestAnimationFrame(() => {
        // Explode outward + float up
        const endTop = startTop - (Math.random() * 40 + 20); // Move up 20-60%
        const rotate = Math.random() * 60 - 30; // Rotate slightly

        el.style.opacity = '1';
        el.style.transform = `translate(-50%, -50%) scale(1) rotate(${rotate}deg)`;
        el.style.top = `${endTop}%`;

        // Fade out
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.filter = 'blur(4px)'; // Add blur on fade out
          setTimeout(() => el.remove(), 500);
        }, duration - 400);
      });
    }
  }

  function handleToggle() {
    const drank = toggleDrank();
    updateUI(drank);
    if (drank) {
      celebrate();
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  function init() {
    // PROTEIN TRACKER INIT
    const drank = getCurrentDrank();

    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.value = currentLang;
      langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem(LANG_KEY, currentLang);
        updateUI(getCurrentDrank());
      });
    }

    updateUI(drank);

    const btn = document.getElementById('toggle-btn');
    if (btn) {
      btn.addEventListener('click', handleToggle);
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      });
    }

    // THEME INIT
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }
    setTheme(loadTheme());

    // CLOCK INIT
    initLocation();
    initWorldClocks();
    updateClock();
    setInterval(updateClock, 1000);

    // Periodic Date Check
    setInterval(function () {
      const current = getCurrentDrank();
      updateUI(current);
    }, 60000);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () { });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
