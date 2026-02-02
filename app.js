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
      stats: "Stats",
      export: "Export",
      statistics: "Statistics",
      currentStreak: "Current Streak:",
      longestStreak: "Longest Streak:",
      completionRate: "Completion Rate:",
      days: "days",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      totalDays: "Total Days"
    },
    fr: {
      title: "Suivi de Protéines",
      btnDrank: "J'ai bu ma protéine",
      btnDrankUndo: "Annuler",
      statusDone: "Protéine prise aujourd'hui.",
      statusNotDone: "Pas encore aujourd'hui.",
      stats: "Statistiques",
      export: "Exporter",
      statistics: "Statistiques",
      currentStreak: "Série actuelle:",
      longestStreak: "Série la plus longue:",
      completionRate: "Taux de réussite:",
      days: "jours",
      today: "Aujourd'hui",
      thisWeek: "Cette semaine",
      thisMonth: "Ce mois",
      totalDays: "Total jours"
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

  function getLongestStreak() {
    const history = getHistory();
    if (history.length === 0) return 0;
    const drankSet = new Set(history);
    const sortedDates = history.map(parseDateKey).sort((a, b) => a - b);
    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate = null;

    for (const date of sortedDates) {
      if (lastDate === null) {
        currentStreak = 1;
      } else {
        const diffDays = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
      lastDate = date;
    }
    return Math.max(longestStreak, currentStreak);
  }

  function getWeekStats() {
    const history = getHistory();
    const drankSet = new Set(history);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(RESET_HOUR, 0, 0, 0);
    
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const key = y + '-' + m + '-' + d;
      if (drankSet.has(key)) count++;
    }
    return count;
  }

  function getMonthStats() {
    const history = getHistory();
    const drankSet = new Set(history);
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    let count = 0;
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = y + '-' + m + '-' + day;
      if (drankSet.has(key)) count++;
    }
    return count;
  }

  function getCompletionRate() {
    const history = getHistory();
    if (history.length === 0) return 0;
    const sortedDates = history.map(parseDateKey).sort((a, b) => a - b);
    const firstDate = sortedDates[0];
    const today = parseDateKey(getDateKey());
    const totalDays = Math.ceil((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    return Math.round((history.length / totalDays) * 100);
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

  /* --- Statistics Functions --- */
  function updateStatistics() {
    const texts = translations[currentLang];
    const todayDrank = getCurrentDrank() ? 1 : 0;
    const weekCount = getWeekStats();
    const monthCount = getMonthStats();
    const totalDays = getHistory().length;

    const todayEl = document.getElementById('stat-today');
    const weekEl = document.getElementById('stat-week');
    const monthEl = document.getElementById('stat-month');
    const totalEl = document.getElementById('stat-total');

    if (todayEl) todayEl.textContent = todayDrank;
    if (weekEl) weekEl.textContent = weekCount;
    if (monthEl) monthEl.textContent = monthCount;
    if (totalEl) totalEl.textContent = totalDays;
  }

  function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const history = getHistory();
    const drankSet = new Set(history);
    const todayKey = getDateKey();
    const today = parseDateKey(todayKey);
    
    // Get first day of current month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = '';
    
    // Day labels
    dayLabels.forEach(label => {
      html += `<div class="calendar-day-label">${label}</div>`;
    });
    
    // Calendar days
    const currentDate = new Date(startDate);
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
    
    while (currentDate <= endDate) {
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      const key = y + '-' + m + '-' + d;
      const isCurrentMonth = currentDate.getMonth() === today.getMonth();
      const isToday = key === todayKey;
      const drank = drankSet.has(key);
      
      let classes = 'calendar-day';
      if (!isCurrentMonth) classes += ' empty';
      if (drank) classes += ' drank';
      if (isToday) classes += ' today';
      
      html += `<div class="${classes}" title="${isCurrentMonth ? (drank ? 'Drank' : 'Not drank') : ''}">${currentDate.getDate()}</div>`;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    calendarEl.innerHTML = html;
  }

  function updateModalStats() {
    const texts = translations[currentLang];
    const streak = getStreak();
    const longestStreak = getLongestStreak();
    const completionRate = getCompletionRate();

    const streakEl = document.getElementById('modal-streak');
    const longestEl = document.getElementById('modal-longest-streak');
    const rateEl = document.getElementById('modal-completion-rate');

    if (streakEl) streakEl.textContent = `${streak} ${texts.days}`;
    if (longestEl) longestEl.textContent = `${longestStreak} ${texts.days}`;
    if (rateEl) rateEl.textContent = `${completionRate}%`;
  }

  function openStatsModal() {
    const modal = document.getElementById('stats-modal');
    const modalTitle = document.getElementById('stats-modal-title');
    if (modal) {
      const texts = translations[currentLang];
      if (modalTitle) modalTitle.textContent = texts.statistics;
      renderCalendar();
      updateModalStats();
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeStatsModal() {
    const modal = document.getElementById('stats-modal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function exportData() {
    const stored = loadState();
    const data = {
      history: stored.history || [],
      drinkTimestamps: stored.drinkTimestamps || [],
      exportDate: new Date().toISOString(),
      stats: {
        totalDays: stored.history?.length || 0,
        currentStreak: getStreak(),
        longestStreak: getLongestStreak(),
        completionRate: getCompletionRate()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protein-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    
    updateStatistics();
  }

  function handleToggle() {
    const drank = toggleDrank();
    updateUI(drank);
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
        // Update action button texts
        const statsBtn = document.getElementById('stats-btn');
        const exportBtn = document.getElementById('export-btn');
        const texts = translations[currentLang];
        if (statsBtn) statsBtn.innerHTML = `<span>📊</span> ${texts.stats}`;
        if (exportBtn) exportBtn.innerHTML = `<span>💾</span> ${texts.export}`;
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

    // STATS MODAL INIT
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
      statsBtn.addEventListener('click', openStatsModal);
      const updateStatsBtnText = () => {
        const texts = translations[currentLang];
        statsBtn.innerHTML = `<span>📊</span> ${texts.stats}`;
      };
      updateStatsBtnText();
      if (langSelect) {
        langSelect.addEventListener('change', updateStatsBtnText);
      }
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportData);
      const updateExportBtnText = () => {
        const texts = translations[currentLang];
        exportBtn.innerHTML = `<span>💾</span> ${texts.export}`;
      };
      updateExportBtnText();
      if (langSelect) {
        langSelect.addEventListener('change', updateExportBtnText);
      }
    }

    const closeModalBtn = document.getElementById('close-stats-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeStatsModal);
    }

    const modal = document.getElementById('stats-modal');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          closeStatsModal();
        }
      });
      
      // Close on Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
          closeStatsModal();
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
