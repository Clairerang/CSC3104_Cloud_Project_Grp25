importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Add required event listeners at initial evaluation so browsers don't warn
// and so push events are always handled even if initialization is async.
self.addEventListener('push', function(event) {
  // Try to show notification from the push payload. If payload is JSON with
  // notification fields, display them. This runs synchronously on event.
  let payload = {};
  try {
    if (event && event.data) payload = event.data.json();
  } catch (e) {
    try { payload = { body: event.data && event.data.text ? event.data.text() : undefined }; } catch (e2) { payload = {}; }
  }
  const title = (payload && payload.notification && payload.notification.title) || payload.title || 'Notification';
  const options = Object.assign({}, (payload && payload.notification) || {}, { data: (payload && payload.data) || {} });

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  // Focus or open the app when notification is clicked
  event.notification.close && event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
    for (const c of clientList) {
      if (c.url && 'focus' in c) return c.focus();
    }
    if (clients.openWindow) return clients.openWindow('/testing-notification');
  }));
});

self.addEventListener('pushsubscriptionchange', function(event) {
  // Browsers may emit this when subscription expires — best effort to re-subscribe
  console.log('sw: pushsubscriptionchange', event);
});

// Initialize the Firebase app in the service worker by fetching config from the server
self.addEventListener('install', (event) => {
  // nothing to do on install
});

async function init() {
  try {
    const res = await fetch('/fcm/config');
    if (!res.ok) { console.warn('sw: no fcm config'); return; }
    const cfg = await res.json();
    firebase.initializeApp({
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId
    });
    const messaging = firebase.messaging();

    // If firebase-messaging provides background message handler, also wire it
    try {
      messaging.onBackgroundMessage(function(payload) {
        console.log('[sw] Received background message ', payload);
        const title = payload.notification && payload.notification.title ? payload.notification.title : 'Notification';
        const options = Object.assign({}, payload.notification || {}, { data: payload.data || {} });
        self.registration.showNotification(title, options);
      });
    } catch (e) {
      // ignore if messaging doesn't expose this method synchronously
      console.warn('sw: messaging.onBackgroundMessage not available yet');
    }
  } catch (e) {
    console.warn('sw init error', e && e.message ? e.message : e);
  }
}

init();
