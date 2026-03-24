(function () {
  "use strict";

  const STORAGE_KEY = "proteinDrinkTracker";
  const THEME_KEY = "proteinTheme";
  const LANG_KEY = "proteinTrackerLang";
  const REMINDER_KEY = "proteinReminder";
  const RESET_HOUR = 2;
  const HISTORY_MAX_DAYS = 365;
  const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // matches SVG r=52

  const STREAK_MILESTONES = [
    { min: 100, icon: "\uD83D\uDC8E", class: "milestone-100" },
    { min: 30, icon: "\uD83D\uDD25", class: "milestone-30" },
    { min: 14, icon: "\u2B50", class: "milestone-14" },
    { min: 7, icon: "\uD83C\uDFC6", class: "milestone-7" },
  ];

  const WORLD_CITIES = [
    { name: "New York", timeZone: "America/New_York" },
    { name: "London", timeZone: "Europe/London" },
    { name: "İstanbul", timeZone: "Europe/Istanbul" },
    { name: "Tokyo", timeZone: "Asia/Tokyo" },
    { name: "Sydney", timeZone: "Australia/Sydney" },
    { name: "Santo Domingo", timeZone: "America/Santo_Domingo" },
    { name: "Stockholm", timeZone: "Europe/Stockholm" },
    { name: "Rome", timeZone: "Europe/Rome" },
  ];

  /* --- Confetti System --- */
  const confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    running: false,
    colors: ['#e94560', '#2ecc71', '#f39c12', '#3498db', '#9b59b6', '#1abc9c', '#f1c40f', '#e74c3c'],

    init() {
      this.canvas = document.getElementById('confetti-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    launch(count) {
      if (!this.ctx) return;
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height * 0.4;
      for (let i = 0; i < (count || 80); i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 8;
        this.particles.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: 4 + Math.random() * 4,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          life: 1,
          decay: 0.008 + Math.random() * 0.008,
          shape: Math.random() > 0.5 ? 'rect' : 'circle',
        });
      }
      if (!this.running) {
        this.running = true;
        this.animate();
      }
    },

    animate() {
      if (!this.ctx || this.particles.length === 0) {
        this.running = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return;
      }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles = this.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;
        if (p.life <= 0) return false;

        this.ctx.save();
        this.ctx.globalAlpha = p.life;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
        return true;
      });
      requestAnimationFrame(() => this.animate());
    }
  };

  /* --- Location Variables --- */
  let userLocation = { city: "Local Time", timeZone: undefined };

  // Get preferred language (default: en)
  let currentLang = localStorage.getItem(LANG_KEY) || "en";

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
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function parseDateKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDisplayDate(dateKey) {
    const d = parseDateKey(dateKey);
    return d.toLocaleDateString(currentLang, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw)
        return {
          dateKey: null,
          drank: false,
          drinkTimestamps: [],
          history: [],
        };
      const data = JSON.parse(raw);
      const history = Array.isArray(data.history) ? data.history : [];
      const drinkTimestamps = Array.isArray(data.drinkTimestamps)
        ? data.drinkTimestamps
        : [];
      return {
        dateKey: data.dateKey || null,
        drank: Boolean(data.drank),
        drinkTimestamps: drinkTimestamps,
        history: history,
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
        JSON.stringify({ dateKey, drank, drinkTimestamps, history: trimmed }),
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
    if (
      stored.dateKey === dateKey &&
      stored.drank &&
      !history.includes(dateKey)
    ) {
      history = history.concat([dateKey]);
      saveState(dateKey, true, history, stored.drinkTimestamps);
    } else if (stored.dateKey === dateKey && !stored.drank) {
      history = history.filter(function (k) {
        return k !== dateKey;
      });
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
      drinkTimestamps = drinkTimestamps.filter(function (ts) {
        return ts.date !== dateKey;
      });
      drinkTimestamps = drinkTimestamps.concat([
        { date: dateKey, time: new Date().toLocaleTimeString() },
      ]);
    } else {
      history = history.filter(function (k) {
        return k !== dateKey;
      });
      drinkTimestamps = drinkTimestamps.filter(function (ts) {
        return ts.date !== dateKey;
      });
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
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = y + "-" + m + "-" + day;
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
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted' && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SET_REMINDER",
            settings: JSON.parse(localStorage.getItem(REMINDER_KEY)),
          });
        }
      });
    } else if (
      "Notification" in window &&
      Notification.permission === "granted" &&
      navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.controller.postMessage({
        type: "SET_REMINDER",
        settings: JSON.parse(localStorage.getItem(REMINDER_KEY)),
      });
    }
  }

  /* --- Location Functions --- */
  async function fetchCityName(lat, lon) {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      );
      if (!res.ok) throw new Error("HTTP Error " + res.status);
      const data = await res.json();
      return data.city || data.locality || "Location Found";
    } catch (e) {
      console.error("City fetch failed", e);
      return "Local Time";
    }
  }

  function initLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        userLocation.city = await fetchCityName(latitude, longitude);
        const el = document.getElementById('main-clock-label');
        if (el) el.textContent = 'Time in ' + userLocation.city;
      });
    }
  }

  /* --- Clock Functions --- */
  function initWorldClocks() {
    const container = document.getElementById("world-clocks");
    if (container) {
      let html = "";
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
    const timeEl = document.getElementById("clock-time");
    const secEl = document.getElementById("clock-seconds");

    if (timeEl && secEl) {
      timeEl.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      secEl.textContent = String(now.getSeconds()).padStart(2, "0");
    }

    WORLD_CITIES.forEach((city, index) => {
      const el = document.getElementById(`world-clock-time-${index}`);
      if (el) {
        el.textContent = now.toLocaleTimeString("en-US", {
          timeZone: city.timeZone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    });
  }

  /* --- Theme Functions --- */
  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "light" ? "☀️" : "🌙";
  }

  function toggleTheme() {
    setTheme(
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark",
    );
  }

  /* --- New Features: Stats, Badges, Heatmap --- */

  function updateMonthlyStats() {
    const history = getHistory();

    // Get current YYYY-MM
    const now = new Date();
    if (now.getHours() < RESET_HOUR) {
      now.setDate(now.getDate() - 1);
    }
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonthPrefix = `${y}-${m}`;

    // Count drank days this month
    let daysDrankThisMonth = 0;
    history.forEach(dateKey => {
      if (dateKey.startsWith(currentMonthPrefix)) {
        daysDrankThisMonth++;
      }
    });

    // Calculate percentage
    const daysInMonth = new Date(y, now.getMonth() + 1, 0).getDate();
    const percentage = Math.round((daysDrankThisMonth / daysInMonth) * 100) || 0;

    // Update DOM
    const statsTextEl = document.getElementById('monthly-stats-text');
    const progressFillEl = document.getElementById('monthly-progress-fill');

    const texts = translations[currentLang];
    let statsString = texts.monthlyStatsCompleted;
    statsString = statsString.replace("{days}", daysDrankThisMonth)
      .replace("{total}", daysInMonth)
      .replace("{percent}", percentage);

    if (statsTextEl) {
      statsTextEl.textContent = statsString;
    }

    if (progressFillEl) {
      progressFillEl.style.width = `${percentage}%`;
    }
  }

  function updateBadges() {
    const streak = getStreak();
    const historyLength = getHistory().length;

    // Define the gamification rules
    const badges = [
      { name: 'First Sip', icon: '🌱', condition: historyLength >= 1 },
      { name: '3-Day Streak', icon: '🔥', condition: streak >= 3 },
      { name: 'Week Warrior', icon: '🥉', condition: streak >= 7 },
      { name: 'Consistency', icon: '🏆', condition: historyLength >= 30 },
      { name: 'Centurion', icon: '💯', condition: historyLength >= 100 }
    ];

    const container = document.getElementById('badges-container');
    if (!container) return;

    let html = '';
    badges.forEach(b => {
      const activeClass = b.condition ? 'unlocked' : '';
      html += `<div class="badge ${activeClass}" title="${b.name}\n${b.condition ? 'Unlocked!' : 'Keep going to unlock'}">${b.icon}</div>`;
    });
    container.innerHTML = html;
  }

  function updateHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;

    const historySet = new Set(getHistory());
    const today = parseDateKey(getDateKey());

    let html = '';
    // Generate the last 364 days + today (365 squares total)
    // grid-auto-flow: column makes it flow top-to-bottom, left-to-right naturally
    for (let i = 364; i >= 0; i--) {
      let d = new Date(today);
      d.setDate(d.getDate() - i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;

      const activeClass = historySet.has(key) ? 'active' : '';

      // Add tooltip showing the date
      const displayDate = d.toLocaleDateString(currentLang, { month: 'short', day: 'numeric' });
      html += `<div class="heatmap-cell ${activeClass}" title="${displayDate}: ${activeClass ? 'Drank protein' : 'Missed'}"></div>`;
    }

    grid.innerHTML = html;

    // Auto-scroll the heatmap to the far right (present day)
    const wrapper = document.querySelector('.heatmap-scroll-wrapper');
    if (wrapper) wrapper.scrollLeft = wrapper.scrollWidth;
  }

  /**
    * --- Motivational Quote Functions ---
    * @param {Object} texts The translations object for the current language.
    * @return {string} The final quote chosen for today.
  */
  function getDailyQuote(texts) {
    const todayKey = getDateKey();
    const storageKey = "proteinDailyQuote";
    const storedData = localStorage.getItem(storageKey);

    let index;

    // Try to load and parse the stored JSON data
    try {
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.date === todayKey && typeof parsed.index === "number") {
          index = parsed.index;
        }
      }
    } catch (e) {
      console.warn("Could not parse stored quote data, generating new quote.");
    }

    // If no valid index for today was found, generate and save a new one
    if (index === undefined) {
      index = Math.floor(Math.random() * texts.motivationalQuotes.length);
      localStorage.setItem(
        storageKey,
        JSON.stringify({ date: todayKey, index: index })
      );
    }

    // Fallback check: Ensure the index is within bounds in case the translations array changed
    if (index >= texts.motivationalQuotes.length || index < 0) {
      index = 0;
    }

    return texts.motivationalQuotes[index];
  }

  /**
   * --- UI Functions ---
   * Updates the entire UI based on the current drank state and language
   * is called multiple times:
   * - when language is changed
   * DO NOT ADD ONE TIME CALLED FUNCTIONS HERE, they should be in init() or separate functions called from init()
   */
  function updateProgressRing(weeklyCount) {
    const fillEl = document.getElementById("progress-ring-fill");
    const countEl = document.getElementById("progress-ring-count");
    const labelEl = document.getElementById("progress-ring-label");
    const ringEl = document.querySelector(".progress-ring");
    if (!fillEl || !countEl) return;

    const ratio = Math.min(weeklyCount / 7, 1);
    const offset = RING_CIRCUMFERENCE * (1 - ratio);
    fillEl.style.strokeDashoffset = offset;
    countEl.textContent = weeklyCount;

    const texts = translations[currentLang];
    if (labelEl) labelEl.textContent = texts.progressLabel || "/7 days";

    if (ringEl) {
      ringEl.classList.toggle("complete", weeklyCount >= 7);
    }
  }

  function getWeeklyCount() {
    const history = getHistory();
    const historySet = new Set(history);
    let count = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      if (new Date().getHours() < RESET_HOUR) d.setDate(d.getDate() - 1);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = y + "-" + m + "-" + day;
      if (historySet.has(key)) count++;
    }
    if (!historySet.has(getDateKey()) && getCurrentDrank()) count++;
    return Math.min(count, 7);
  }

  function updateStreakBadge(streak) {
    const badge = document.getElementById("streak-badge");
    const iconEl = document.getElementById("streak-badge-icon");
    const textEl = document.getElementById("streak-badge-text");
    if (!badge || !iconEl || !textEl) return;

    const texts = translations[currentLang];
    let milestone = null;
    for (const m of STREAK_MILESTONES) {
      if (streak >= m.min) { milestone = m; break; }
    }

    badge.className = "streak-badge";
    if (milestone) {
      iconEl.textContent = milestone.icon;
      textEl.textContent = streak + " " + (texts.statusStreak || "day streak!");
      badge.classList.add(milestone.class);
    } else if (streak > 0) {
      iconEl.textContent = "\uD83D\uDCAA";
      textEl.textContent = streak + " " + (texts.statusStreak || "day streak!");
    } else {
      badge.classList.add("hidden");
    }
  }

  function updateUI(drank) {
    const dateKey = getDateKey();
    const stored = loadState();
    const flexed = document.getElementById("arm-flexed");
    const weak = document.getElementById("arm-weak");
    const btn = document.getElementById("toggle-btn");
    const status = document.getElementById("status-text");
    const title = document.querySelector(".logo-text");
    const dateEl = document.getElementById("date-text");
    const streakEl = document.getElementById("streak-text");
    const lastTimeEl = document.getElementById("last-time");
    const mainClockLabel = document.getElementById("main-clock-label");
    const proteinFoodListBtn = document.getElementById("protein-food-list-btn");
    const achievementsTitle = document.getElementById("achievements-title");
    const heatmapTitle = document.getElementById("heatmap-title");
    const statsBtn = document.getElementById("toggle-stats-btn");
    const texts = translations[currentLang];
    if (achievementsTitle) achievementsTitle.textContent = texts.achievementsTitle;
    if (heatmapTitle) heatmapTitle.textContent = texts.yearlyConsistencyTitle;
    const fullHistoryTitleEl = document.getElementById("full-history-title");
    if (fullHistoryTitleEl) fullHistoryTitleEl.textContent = texts.fullHistoryTitle;
    const exportCsvBtnEl = document.getElementById("export-csv-btn");
    if (exportCsvBtnEl) exportCsvBtnEl.textContent = texts.exportCsvBtn;
    const exportPdfBtnEl = document.getElementById("export-pdf-btn");
    if (exportPdfBtnEl) exportPdfBtnEl.textContent = texts.exportPdfBtn;
    const thDate = document.getElementById("history-th-date");
    if (thDate) thDate.textContent = texts.historyTableDate;
    const thDay = document.getElementById("history-th-day");
    if (thDay) thDay.textContent = texts.historyTableDay;
    const thTime = document.getElementById("history-th-time");
    if (thTime) thTime.textContent = texts.historyTableTimeLogged;
    const thStatus = document.getElementById("history-th-status");
    if (thStatus) thStatus.textContent = texts.historyTableStatus;
    const historyEmptyEl = document.getElementById("history-table-empty");
    if (historyEmptyEl) historyEmptyEl.textContent = texts.historyEmpty;

    if (statsBtn) {
      const statsSection = document.getElementById("monthly-stats-section");
      const isHidden = statsSection && statsSection.classList.contains("hidden");
      statsBtn.textContent = isHidden ? texts.showStatsBtn : texts.hideStatsBtn;
    }

    if (title) title.textContent = texts.title;
    if (proteinFoodListBtn)
      proteinFoodListBtn.textContent = texts.proteinFoodListBtn;
    if (flexed) flexed.classList.toggle("hidden", !drank);
    if (weak) weak.classList.toggle("hidden", drank);
    if (btn) btn.textContent = drank ? texts.btnDrankUndo : texts.btnDrank;
    if (status)
      status.textContent = drank ? texts.statusDone : texts.statusNotDone;
    if (mainClockLabel) mainClockLabel.textContent = texts.localTime;
    if (dateEl) dateEl.textContent = formatDisplayDate(dateKey);

    const streak = getStreak();
    if (streakEl) {
      streakEl.textContent =
        streak > 0 ? `${streak} ${texts.statusStreak}` : "";
    }

    if (lastTimeEl) {
      const timestamps = stored.drinkTimestamps || [];
      if (timestamps.length) {
        const recent = timestamps[timestamps.length - 1];
        lastTimeEl.textContent = `${texts.lastDrankLabel} : ${recent.time}`;
      } else {
        lastTimeEl.textContent = "";
      }
    }
    updateHistoryLog();
    updateHistoryTable();
    updateMonthlyStats();
    updateBadges();
    updateHeatmap();
    updateProgressRing(getWeeklyCount());
    updateStreakBadge(streak);

    const quoteEl = document.getElementById("motivational-quote");
    if (quoteEl) quoteEl.textContent = getDailyQuote(texts);
  }

  function updateHistoryLog() {
    const logContainer = document.getElementById("history-log");
    if (!logContainer) return;

    const stored = loadState();
    const history = stored.history || [];
    const historySet = new Set(history);
    const todayKey = getDateKey();
    let html = "";

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
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = y + "-" + m + "-" + day;

      const isToday = key === todayKey;
      let status = "⚪";
      if (historySet.has(key)) {
        status = "✅";
      } else if (isToday && getCurrentDrank()) {
        status = "✅";
      }

      const dayName = d.toLocaleDateString(currentLang, { weekday: "narrow" });

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
      const texts = translations[currentLang]; //get current translation
      confetti.launch(100);

      const streak = getStreak();
      if (streak >= 7 && STREAK_MILESTONES.some(function (m) { return streak === m.min; })) {
        setTimeout(function () { confetti.launch(150); }, 400);
        setTimeout(function () { confetti.launch(100); }, 800);
      }

      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_DRINK_NOTIFICATION",
          title: `\uD83E\uDD64 ${texts.title}`,
          body: texts.statusDone,
        });
      }
      showNotificationAlert(`\u2705 ${texts.statusDone}`);
    }
  }

  function showNotificationAlert(message) {
    const alert = document.createElement("div");
    alert.textContent = message;
    Object.assign(alert.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #2ecc71, #27ae60)",
      color: "white",
      padding: "14px 24px",
      borderRadius: "12px",
      zIndex: "9998",
      fontWeight: "700",
      fontSize: "0.95rem",
      boxShadow: "0 8px 30px rgba(46, 204, 113, 0.3)",
      animation: "slideIn 0.3s ease-out",
      backdropFilter: "blur(10px)",
    });
    document.body.appendChild(alert);

    setTimeout(function () {
      alert.style.animation = "slideOut 0.3s ease-out";
      setTimeout(function () { alert.remove(); }, 300);
    }, 3000);
  }

    /* ── HISTORY TABLE ── */
  function updateHistoryTable() {
    const stored = loadState();
    const history = stored.history || [];
    const drinkTimestamps = stored.drinkTimestamps || [];
    const tbody = document.getElementById('history-table-body');
    const emptyMsg = document.getElementById('history-table-empty');
    if (!tbody) return;

    if (!history.length) {
      tbody.innerHTML = '';
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    // Sort newest first
    const sorted = [...history].sort((a, b) => (a < b ? 1 : -1));
    tbody.innerHTML = sorted.map(function(dateKey) {
      const d = parseDateKey(dateKey);
      const dateStr = d.toLocaleDateString(currentLang, { day: '2-digit', month: 'short', year: 'numeric' });
      const dayStr = d.toLocaleDateString(currentLang, { weekday: 'long' });
      const ts = drinkTimestamps.find(function(t) { return t.date === dateKey; });
      const timeStr = ts ? ts.time : '—';
      return `<tr>
        <td class="td-date">${dateStr}</td>
        <td class="td-day">${dayStr}</td>
        <td class="td-time">${timeStr}</td>
        <td class="td-status">✅</td>
      </tr>`;
    }).join('');
  }

  /* ── CSV EXPORT ── */
  function exportCSV() {
    const stored = loadState();
    const history = stored.history || [];
    const drinkTimestamps = stored.drinkTimestamps || [];
    const t = translations[currentLang];
    if (!history.length) { alert(t.alertNoHistoryExport); return; }
    const rows = [[t.historyTableDate, t.historyTableDay, t.historyTableTimeLogged, t.historyTableStatus]];
    const sorted = [...history].sort((a, b) => (a < b ? 1 : -1));
    sorted.forEach(function(dateKey) {
      const d = parseDateKey(dateKey);
      const dateStr = d.toLocaleDateString(currentLang, { day: '2-digit', month: 'short', year: 'numeric' });
      const dayStr = d.toLocaleDateString(currentLang, { weekday: 'long' });
      const ts = drinkTimestamps.find(function(t) { return t.date === dateKey; });
      rows.push([dateStr, dayStr, ts ? ts.time : '—', 'Drank ✓']);
    });

    const csv = rows.map(function(r) { return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'protein-history.csv';
    a.click();
  }

  /* ── PDF EXPORT ── */
  function exportPDF() {
    const stored = loadState();
    const history = stored.history || [];
    const drinkTimestamps = stored.drinkTimestamps || [];
    const t = translations[currentLang];
    if (!history.length) { alert(t.alertNoHistoryExport); return; }
    if (!window.jspdf) { alert('PDF library not loaded yet, please try again.'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210, pageH = 297, margin = 18, colW = pageW - margin * 2;
    let y = margin;

    // Full page dark background
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Header bar
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageW, 38, 'F');
    doc.setTextColor(238, 238, 238);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Protein Drink Tracker', margin, 22);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 200);
    doc.text('History exported on ' + new Date().toLocaleDateString(currentLang, { day: '2-digit', month: 'long', year: 'numeric' }), margin, 32);

    y = 50;

    // Table header
    doc.setFillColor(42, 42, 74);
    doc.roundedRect(margin, y, colW, 9, 2, 2, 'F');
    doc.setTextColor(180, 180, 200);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    const c = [margin + 3, margin + 48, margin + 90, margin + 130];
    doc.text(t.historyTableDate, c[0], y + 6);
    doc.text(t.historyTableDay, c[1], y + 6);
    doc.text(t.historyTableTimeLogged, c[2], y + 6);
    doc.text(t.historyTableStatus, c[3], y + 6);
    y += 12;

    const sorted = [...history].sort((a, b) => (a < b ? 1 : -1));
    sorted.forEach(function(dateKey, idx) {
      if (y > 278) { doc.addPage(); y = margin; }
      const d = parseDateKey(dateKey);
      const dateStr = d.toLocaleDateString(currentLang, { day: '2-digit', month: 'short', year: 'numeric' });
      const dayStr = d.toLocaleDateString(currentLang, { weekday: 'long' });
      const ts = drinkTimestamps.find(function(t) { return t.date === dateKey; });

      // Draw a dark row background for every row to keep PDF fully dark
      doc.setFillColor(42, 42, 74);
      doc.rect(margin, y - 1, colW, 9, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(233, 69, 96);
      doc.setFontSize(8.5);
      doc.text(dateStr, c[0], y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 220);
      doc.text(dayStr, c[1], y + 5);
      doc.text(ts ? ts.time : '—', c[2], y + 5);

      doc.setTextColor(46, 204, 113);
      doc.text('Drank', c[3], y + 5);

      y += 10;
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 150);
    doc.text(history.length + ' days tracked in total', margin, 292);

    doc.save('protein-history.pdf');
  }


  function init() {
    confetti.init();
    const drank = getCurrentDrank();

    const langSelect = document.getElementById("lang-select");
    if (langSelect) {
      langSelect.value = currentLang;
      langSelect.addEventListener("change", (e) => {
        currentLang = e.target.value;
        localStorage.setItem(LANG_KEY, currentLang);
        updateUI(getCurrentDrank());
      });
    }

    updateUI(drank);

    const btn = document.getElementById("toggle-btn");
    if (btn) {
      btn.addEventListener("click", handleToggle);
      btn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      });
    }

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    setTheme(loadTheme());

    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) csvBtn.addEventListener('click', exportCSV);
    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) pdfBtn.addEventListener('click', exportPDF);

    initLocation();
    initWorldClocks();
    updateClock();
    setInterval(updateClock, 1000);

    const statsBtn = document.getElementById('toggle-stats-btn');
    const statsSection = document.getElementById('monthly-stats-section');
    if (statsBtn && statsSection) {
      statsBtn.addEventListener('click', () => {
        const texts = translations[currentLang]; // Get current language translations
        const isHidden = statsSection.classList.contains('hidden');
        if (isHidden) {
          statsSection.classList.remove('hidden');
          statsSection.setAttribute('aria-hidden', 'false');
          statsBtn.textContent = texts.hideStatsBtn; // Use translation
        } else {
          statsSection.classList.add('hidden');
          statsSection.setAttribute('aria-hidden', 'true');
          statsBtn.textContent = texts.showStatsBtn; // Use translation
        }
      });
    }

    setInterval(function () {
      updateUI(getCurrentDrank());
    }, 60000);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("sw.js")
        .then(initReminder)
        .catch(function () { });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
