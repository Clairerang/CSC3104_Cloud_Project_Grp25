/* eslint-disable no-undef */
// Firebase Messaging service worker
// Loads firebase compat libraries and initializes messaging to enable background notifications.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// IMPORTANT: Event handlers MUST be registered at top level before any Firebase initialization
// Required push event handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const notification = payload.notification || {};
    const title = notification.title || 'Notification';
    const options = {
      body: notification.body || '',
      icon: notification.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: payload.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (e) {
    console.error('[SW] push event error', e);
  }
});

// Required pushsubscriptionchange event handler
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        console.log('[SW] Subscription refreshed');
        return subscription;
      })
  );
});

// Required notificationclick event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

self.addEventListener('install', () => {
  self.skipWaiting && self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await ensureInit();
    if (self.clients && self.clients.claim) {
      await self.clients.claim();
    }
  })());
});

let messaging;

async function ensureInit() {
  if (messaging) return messaging;
  try {
    const res = await fetch('/api/notification/fcm/config');
    if (!res.ok) throw new Error('No FCM config');
    const cfg = await res.json();
    firebase.initializeApp({
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId
    });
    messaging = firebase.messaging();
    return messaging;
  } catch (e) {
    console.warn('[SW] Firebase init failed:', e && e.message ? e.message : e);
    return null;
  }
}

// Handle background FCM messages (Firebase compat API)
ensureInit().then((msg) => {
  if (!msg) return;
  msg.onBackgroundMessage((payload) => {
    try {
      const notification = payload.notification || {};
      const title = notification.title || 'Notification';
      const options = {
        body: notification.body || '',
        icon: notification.icon || '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data || {}
      };
      self.registration.showNotification(title, options);
    } catch (e) {
      console.warn('[SW] onBackgroundMessage error', e);
    }
  });
});
