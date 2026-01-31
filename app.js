(function () {
  'use strict';

  const STORAGE_KEY = 'proteinDrinkTracker';
  const RESET_HOUR = 2; // 2am local

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

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { dateKey: null, count: 0, goal: 1, streak: 0, lastStreakDate: null };
      const data = JSON.parse(raw);
      
      // Migration of old boolean state to counter state
      let initialCount = Number(data.count);
      if (isNaN(initialCount)) {
        initialCount = data.drank ? 1 : 0;
      }

      return {
        dateKey: data.dateKey || null,
        count: initialCount,
        goal: Number(data.goal) || 1,
        streak: Number(data.streak) || 0,
        lastStreakDate: data.lastStreakDate || null
      };
    } catch (e) {
      console.error("Error loading state:", e);
      return { dateKey: null, count: 0, goal: 1, streak: 0, lastStreakDate: null };
    }
  }

  function saveState(dateKey, count, goal, streak, lastStreakDate) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dateKey, count, goal, streak, lastStreakDate }));
    } catch (_) {}
  }

  function getYesterdayKey(dateKey) {
    const parts = dateKey.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    date.setDate(date.getDate() - 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function getCurrentState() {
    const dateKey = getDateKey();
    const stored = loadState();
    if (stored.dateKey !== dateKey) {
      // New day, reset count but keep streak and goal
      return { ...stored, dateKey, count: 0 };
    }
    return stored;
  }

  function updateGoal(newGoal) {
    const state = getCurrentState();
    state.goal = newGoal;
    saveState(state.dateKey, state.count, state.goal, state.streak, state.lastStreakDate);
    updateUI();
  }

  function incrementCount() {
    const state = getCurrentState();
    const dateKey = state.dateKey;
    const yesterday = getYesterdayKey(dateKey);
    
    state.count += 1;
    
    // Check if goal met for streak
    if (state.count === state.goal) {
      if (state.lastStreakDate === yesterday) {
        state.streak += 1;
        state.lastStreakDate = dateKey;
      } else if (state.lastStreakDate === dateKey) {
        // Goal already met today, don't increment streak again
      } else {
        state.streak = 1;
        state.lastStreakDate = dateKey;
      }
    }

    saveState(state.dateKey, state.count, state.goal, state.streak, state.lastStreakDate);
    updateUI();
  }

  function resetToday() {
    const state = getCurrentState();
    const dateKey = state.dateKey;
    const yesterday = getYesterdayKey(dateKey);

    // If goal was previously met today, decrement streak
    if (state.count >= state.goal && state.lastStreakDate === dateKey) {
      state.streak = Math.max(0, state.streak - 1);
      state.lastStreakDate = yesterday;
    }

    state.count = 0;
    saveState(state.dateKey, state.count, state.goal, state.streak, state.lastStreakDate);
    updateUI();
  }

  function updateUI() {
    const flexed = document.getElementById('arm-flexed');
    const weak = document.getElementById('arm-weak');
    const btn = document.getElementById('toggle-btn');
    const status = document.getElementById('status-text');
    const streakCount = document.getElementById('streak-count');
    const progressText = document.getElementById('progress-text');
    const goalInput = document.getElementById('goal-input');

    const state = getCurrentState();
    const dateKey = state.dateKey;
    const yesterday = getYesterdayKey(dateKey);
    const completed = state.count >= state.goal;
    
    // Validate streak: if lastStreakDate is older than yesterday, streak is broken
    let displayedStreak = state.streak;
    if (state.lastStreakDate !== dateKey && state.lastStreakDate !== yesterday) {
      displayedStreak = 0;
    }

    if (flexed) flexed.classList.toggle('hidden', !completed);
    if (weak) weak.classList.toggle('hidden', completed);
    if (btn) {
      btn.setAttribute('aria-pressed', completed ? 'true' : 'false');
    }
    if (status) {
      status.textContent = completed ? 'Goal completed for today!' : 'Keep going!';
    }
    if (streakCount) {
      streakCount.textContent = displayedStreak;
    }
    if (progressText) {
      progressText.textContent = `${state.count} / ${state.goal}`;
    }
    if (goalInput) {
      goalInput.value = state.goal;
    }
  }

  function handleIncrement() {
    incrementCount();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  function init() {
    updateUI();

    const btn = document.getElementById('toggle-btn');
    if (btn) {
      btn.addEventListener('click', handleIncrement);
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetToday);
    }

    const goalInput = document.getElementById('goal-input');
    if (goalInput) {
      goalInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (val > 0) updateGoal(val);
      });
    }

    // Optional: re-check dateKey periodically while app is open (e.g. across midnight)
    setInterval(function () {
      updateUI();
    }, 60000);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

