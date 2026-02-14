(function () {
  'use strict';

  const STORAGE_KEY = 'proteinDrinkTracker';
  const THEME_KEY = 'proteinTheme';
  const LANG_KEY = 'proteinTrackerLang';
  const REMINDER_KEY = 'proteinReminder';
  const RESET_HOUR = 2; // 2am local
  const HISTORY_MAX_DAYS = 365;

  const WORLD_CITIES = [
    { name: 'New York', timeZone: 'America/New_York' },
    { name: 'London', timeZone: 'Europe/London' },
    { name: 'Tokyo', timeZone: 'Asia/Tokyo' },
    { name: 'Sydney', timeZone: 'Australia/Sydney' }
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
      statusNotDone: "Not yet today.",
      statusStreak: "day streak!"
    },
    fr: {
      title: "Suivi de Protéines",
      btnDrank: "J'ai bu ma protéine",
      btnDrankUndo: "Défaire",
      statusDone: "Protéine prise aujourd'hui.",
      statusNotDone: "Pas encore aujourd'hui.",
      statusStreak: "jour(s) consécutif(s)!"
    },
    nl: {
      title: "Eiwitdrank Tracker",
      btnDrank: "Ik heb mijn eiwit gedronken",
      btnDrankUndo: "Ongedaan maken",
      statusDone: "Eiwit voor vandaag gedronken.",
      statusNotDone: "Nog niet vandaag.",
      statusStreak: "dag(en) op rij!"
    },
    ar: {
      title: "متتبع البروتين",
      btnDrank: "شربت مشروب البروتين",
      btnDrankUndo: "إلغاء",
      statusDone: "تم شرب البروتين اليوم",
      statusNotDone: "لم يتم شربه بعد اليوم",
      statusStreak: "أيام متتالية!"
    }
  };

  // 2. motivational quotes
  const motivationalQuotes = [
    "Stay strong! 💪",
    "Consistency is key! 🔑",
    "One sip at a time! 🥤",
    "Fuel your body! ⚡",
    "You're doing great! 🌟",
    "Hydrate and thrive! 💧",
    "Keep the streak alive! 🔥",
    "Protein power! 🏋️‍♂️"
  ];

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
    return d.toLocaleDateString(currentLang, { weekday: 'long', month: 'short', day: 'numeric' });
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
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ dateKey, drank, drinkTimestamps, history: trimmed })
      );
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

  /* 🔔 Notification reminder initialization */
  function initReminder() {
    if (!localStorage.getItem(REMINDER_KEY)) {
      localStorage.setItem(REMINDER_KEY, JSON.stringify({
        enabled: true,
        time: '09:00',
        lastNotified: null
      }));
    }

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(function(permission) {
        if (permission === 'granted' && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SET_REMINDER',
            settings: JSON.parse(localStorage.getItem(REMINDER_KEY))
          });
        }
      });
    } else if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_REMINDER',
        settings: JSON.parse(localStorage.getItem(REMINDER_KEY))
      });
    }
  }

  /* --- Location Functions --- */
  async function fetchCityName(lat, lon) {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (!res.ok) throw new Error('HTTP Error ' + res.status);
      const data = await res.json();
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
      }, () => {
        const el = document.getElementById('main-clock-label');
        if (el) el.textContent = 'Local Time';
      });
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
    const timeEl = document.getElementById('clock-time');
    const secEl = document.getElementById('clock-seconds');

    if (timeEl && secEl) {
      timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      secEl.textContent = String(now.getSeconds()).padStart(2, '0');
    }

    WORLD_CITIES.forEach((city, index) => {
      const el = document.getElementById(`world-clock-time-${index}`);
      if (el) {
        el.textContent = now.toLocaleTimeString('en-US', {
          timeZone: city.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
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
    if (btn) btn.textContent = theme === 'light' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  /* --- Motivational Quote Functions --- */
  function getDailyQuote() {
    const todayKey = getDateKey();
    const storedQuoteKey = localStorage.getItem('proteinDailyQuote');
    if (storedQuoteKey && storedQuoteKey.startsWith(todayKey)) {
      const index = parseInt(storedQuoteKey.split('-')[1]);
      return motivationalQuotes[index] || motivationalQuotes[0];
    }
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    localStorage.setItem('proteinDailyQuote', `${todayKey}-${randomIndex}`);
    return motivationalQuotes[randomIndex];
  }

  /* --- UI Functions --- */
  function updateUI(drank) {
    const dateKey = getDateKey();
    const stored = loadState();
    const flexed = document.getElementById('arm-flexed');
    const weak = document.getElementById('arm-weak');
    const btn = document.getElementById('toggle-btn');
    const status = document.getElementById('status-text');
    const title = document.querySelector('.logo-text');
    const dateEl = document.getElementById('date-text');
    const streakEl = document.getElementById('streak-text');
    const lastTimeEl = document.getElementById('last-time');
    const texts = translations[currentLang];

    if (title) title.textContent = texts.title;
    if (flexed) flexed.classList.toggle('hidden', !drank);
    if (weak) weak.classList.toggle('hidden', drank);
    if (btn) btn.textContent = drank ? texts.btnDrankUndo : texts.btnDrank;
    if (status) status.textContent = drank ? texts.statusDone : texts.statusNotDone;
    if (dateEl) dateEl.textContent = formatDisplayDate(dateKey);

    if (streakEl) {
      const streak = getStreak();
      streakEl.textContent = streak > 0 ? `${streak} ${texts.statusStreak}` : '';
    }

    if (lastTimeEl) {
      const timestamps = stored.drinkTimestamps || [];
      if (timestamps.length) {
        const recent = timestamps[timestamps.length - 1];
        lastTimeEl.textContent = `Last drank at: ${recent.time}`;
      } else {
        lastTimeEl.textContent = '';
      }
    }
    updateHistoryLog();

    // Update motivational quote
    const quoteEl = document.getElementById('motivational-quote');
    if (quoteEl) quoteEl.textContent = getDailyQuote();
  }

  function updateHistoryLog() {
    const logContainer = document.getElementById('history-log');
    if (!logContainer) return;

    const stored = loadState();
    const history = stored.history || [];
    const historySet = new Set(history);
    const todayKey = getDateKey();
    let html = '';

    // Last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      // App day logic: if currently before 2am, today is still "yesterday"
      const currentHour = new Date().getHours();
      if (currentHour < RESET_HOUR) {
        d.setDate(d.getDate() - 1);
      }
      d.setDate(d.getDate() - i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = y + '-' + m + '-' + day;

      const isToday = key === todayKey;
      let status = '⚪';
      if (historySet.has(key)) {
        status = '✅';
      } else if (isToday && getCurrentDrank()) {
        status = '✅';
      }

      const dayName = d.toLocaleDateString(currentLang, { weekday: 'narrow' });

      html += `
        <div class="history-day">
          <span class="day-label">${dayName}</span>
          <span class="day-status" title="${key}">${status}</span>
        </div>
      `;
    }
    logContainer.innerHTML = html;
  }

  function handleToggle() {
    const drank = toggleDrank();
    updateUI(drank);
    navigator.vibrate?.(50);
    if (drank) {
      console.log('[App] drank=true, attempting notification');
      console.log('[App] SW Controller:', navigator.serviceWorker.controller);
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_DRINK_NOTIFICATION',
          title: '🥤 Protein Tracked!',
          body: 'Great job! You\'ve logged your protein drink today.'
        });
        console.log('[App] Message sent to SW');
        showNotificationAlert('✅ Good Job.Keep Going..!');
      } else {
        console.log('[App] No SW controller available');
        showNotificationAlert('⚠️ Service Worker not ready');
      }
    }
  }

  function showNotificationAlert(message) {
    const alert = document.createElement('div');
    alert.textContent = message;
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: bold;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => alert.remove(), 300);
    }, 3000);
  }

  function init() {
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

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    setTheme(loadTheme());

    initLocation();
    initWorldClocks();
    updateClock();
    setInterval(updateClock, 1000);

    setInterval(function () {
      updateUI(getCurrentDrank());
    }, 60000);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(initReminder).catch(function () { });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
