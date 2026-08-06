/**
 * Service Worker - Protein Drink Tracker
 *
 * Responsibilities:
 *   1. Cache static assets for offline-first behavior.
 *   2. Serve cached responses when the network is unavailable.
 *   3. Receive reminder settings from the main thread and fire
 *      scheduled notifications at the configured time.
 *   4. Handle notification-click events (re-focus / open the app).
 */

/* ==========================================================================
 * 1. CACHE CONFIGURATION
 * ========================================================================== */

/**
 * Bump the version suffix whenever cached assets change so the
 * activate step can purge stale caches automatically.
 */
const CACHE_NAME = 'protein-tracker-v3';

/** Static assets pre-cached during the install phase. */
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './translations.js',
  './manifest.json',
  './icons/icon2.svg',
  './images/drank.png',
  './images/not-drank.png'
];

/* ==========================================================================
 * 2. REMINDER STATE
 *
 * The main thread sends reminder preferences via postMessage.
 * We keep them in-memory and poll every 60 s to decide whether
 * a notification should fire.
 * ========================================================================== */

/** @type {{ enabled: boolean, time: string, lastNotified: string|null } | null} */
let reminderSettings = null;

/** Handle returned by setInterval so we can reset the check loop. */
let reminderCheckInterval = null;

/* ==========================================================================
 * 3. SERVICE WORKER LIFECYCLE
 * ========================================================================== */

/**
 * Install: pre-cache all static assets and skip the waiting phase
 * so the new SW activates immediately.
 */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

/**
 * Activate: delete any caches from older versions, then claim all
 * open clients so they start using this SW without a reload.
 */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/**
 * Fetch: network-first strategy.  If the network request fails
 * (e.g. offline), fall back to the cache.  Non-GET requests are
 * ignored so form POSTs, etc. pass through normally.
 */
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

/* ==========================================================================
 * 4. MESSAGE HANDLING
 *
 * The main thread communicates via postMessage with two message types:
 *   - SET_REMINDER            : update reminder preferences & restart check loop.
 *   - SHOW_DRINK_NOTIFICATION : immediately show a "drink logged" notification.
 * ========================================================================== */

self.addEventListener('message', event => {
  const { type } = event.data || {};
  console.log('[SW] Message received:', type);

  if (type === 'SET_REMINDER') {
    reminderSettings = event.data.settings;
    if (reminderCheckInterval) clearInterval(reminderCheckInterval);
    startReminderCheck();

  } else if (type === 'SHOW_DRINK_NOTIFICATION') {
    console.log('[SW] Showing notification...');
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      tag: 'protein-notification',
      requireInteraction: false
    }).then(() => {
      console.log('[SW] Notification shown successfully');
    }).catch(err => {
      console.log('[SW] Notification error:', err);
    });
  }
});

/* ==========================================================================
 * 5. REMINDER CHECK LOOP
 *
 * Every 60 seconds we compare the current time against the user's
 * preferred reminder time.  If they match (hour + minute) and we
 * haven't already notified today, fire the reminder and broadcast
 * the updated "lastNotified" date back to all clients.
 * ========================================================================== */

/**
 * Evaluate whether a reminder notification should be shown right now.
 * Conditions: reminders enabled, current HH:MM matches configured time,
 * and we haven't already notified for today's date.
 */
function checkReminder() {
  if (!reminderSettings || !reminderSettings.enabled) return;

  const now = new Date();
  const [h, m] = reminderSettings.time.split(':').map(Number);
  const today = now.toISOString().split('T')[0];

  if (
    now.getHours() === h &&
    now.getMinutes() === m &&
    reminderSettings.lastNotified !== today
  ) {
    self.registration.showNotification('\uD83D\uDCAA Protein Reminder!', {
      body: 'Time to drink your protein! Did you have your drink today?',
      icon: './icons/icon2.svg',
      badge: './icons/icon2.svg',
      tag: 'protein-reminder',
      requireInteraction: false
    });

    /* Mark today as notified and broadcast to all open clients. */
    reminderSettings.lastNotified = today;
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_REMINDER',
          settings: reminderSettings
        });
      });
    });
  }
}

/**
 * Start (or restart) the 60-second polling loop and run an
 * immediate check so we don't wait a full minute on first load.
 */
function startReminderCheck() {
  reminderCheckInterval = setInterval(() => {
    checkReminder();
  }, 60000);
  checkReminder();
}

/* ==========================================================================
 * 6. NOTIFICATION CLICK
 * ========================================================================== */

/** When the user taps a notification, close it and focus / open the app. */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('./'));
});

/* Kick off the reminder loop on SW startup. */
startReminderCheck();
