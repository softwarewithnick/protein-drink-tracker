const CACHE_NAME = 'protein-tracker-v19';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon1.png',
  './images/drank.png',
  './images/not-drank.png'
];

/* 🔔 ADDED: reminder state */
let reminderSettings = null;
let reminderCheckInterval = null;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    }).catch(function (error) {
      console.error('Cache initialization failed:', error);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

/* 🔔 ADDED: receive reminder settings */
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data?.type);
  if (event.data?.type === 'SET_REMINDER') {
    reminderSettings = event.data.settings;
    if (reminderCheckInterval) clearInterval(reminderCheckInterval);
    startReminderCheck();
  } else if (event.data?.type === 'SHOW_DRINK_NOTIFICATION') {
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

/* 🔔 ADDED: reminder checker */
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
    self.registration.showNotification('💪 Protein Reminder!', {
      body: 'Time to drink your protein! Did you have your drink today?',
      icon: './icons/icon2.svg',
      badge: './icons/icon2.svg',
      tag: 'protein-reminder',
      requireInteraction: false
    });

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

/*setInterval(checkReminder, 60000);

/* 🔔 ADDED: click handler */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('./'));
});

function startReminderCheck() {
  reminderCheckInterval = setInterval(() => {
    checkReminder();
  }, 60000);
  checkReminder();
}

startReminderCheck();
