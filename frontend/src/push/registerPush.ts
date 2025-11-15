// Lightweight FCM registration helper for the senior web client
// - Fetches Firebase config via API gateway proxy
// - Registers service worker
// - Requests notification permission
// - Retrieves FCM token and saves it to backend via API gateway proxy

import { FirebaseApp, initializeApp } from 'firebase/app';
import { getMessaging, getToken, Messaging, onMessage } from 'firebase/messaging';

function decodeJwtUserId(token: string | null): string | null {
  if (!token) return null;
  try {
    const [, payloadB64] = token.split('.') as [string, string, string];
    const json = JSON.parse(atob(payloadB64));
    // common fields: userId or id
    return json.userId || json.id || null;
  } catch {
    return null;
  }
}

async function getFirebaseConfig() {
  const res = await fetch('/api/notification/fcm/config');
  if (!res.ok) throw new Error('FCM config not available');
  const cfg = await res.json();
  return cfg as { apiKey: string; authDomain?: string; projectId?: string; messagingSenderId: string; appId?: string; vapidKey?: string };
}

export async function registerPush(userIdFromProp?: string, onNotificationReceived?: (notification: { title: string; body: string }) => void) {
  try {
    console.log('[FCM] Starting push notification registration...');

    // Determine userId: prefer explicit param, else decode from session token
    const sessionToken = sessionStorage.getItem('token');
    const decodedUserId = decodeJwtUserId(sessionToken);
    const userId = userIdFromProp || decodedUserId;
    if (!userId) {
      console.warn('[FCM] Cannot register push: missing userId');
      return;
    }
    console.log('[FCM] User ID:', userId);

    // Get Firebase config from backend
    console.log('[FCM] Fetching Firebase config...');
    const cfg = await getFirebaseConfig();
    console.log('[FCM] Firebase config retrieved:', { projectId: cfg.projectId, hasVapidKey: !!cfg.vapidKey });

    // Register service worker first so getToken binds to it
    if (!('serviceWorker' in navigator)) {
      console.warn('[FCM] Service workers not supported');
      return;
    }
    console.log('[FCM] Registering service worker...');
    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[FCM] Service worker registered:', swReg.active ? 'active' : 'installing');

    // Wait for service worker to be ready
    console.log('[FCM] Waiting for service worker to be ready...');
    await navigator.serviceWorker.ready;
    console.log('[FCM] Service worker is ready');

    // Initialize Firebase app + messaging
    console.log('[FCM] Initializing Firebase app...');
    const app: FirebaseApp = initializeApp({
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId
    });
    const messaging: Messaging = getMessaging(app);
    console.log('[FCM] Firebase messaging initialized');

    // Request permission
    console.log('[FCM] Requesting notification permission...');
    const perm = await Notification.requestPermission();
    console.log('[FCM] Notification permission:', perm);
    if (perm !== 'granted') {
      console.warn('[FCM] Notification permission not granted');
      return;
    }

    // Get FCM token
    console.log('[FCM] Getting FCM token...');
    console.log('[FCM] Using VAPID key:', cfg.vapidKey ? cfg.vapidKey.slice(0, 20) + '...' : 'missing');

    let token: string;
    try {
      const readySwReg = await navigator.serviceWorker.ready;
      token = await getToken(messaging, {
        vapidKey: cfg.vapidKey,
        serviceWorkerRegistration: readySwReg
      });
      console.log('[FCM] FCM token received:', token ? token.slice(0, 20) + '...' : 'null');

      if (!token) {
        console.warn('[FCM] getToken returned empty token');
        return;
      }
    } catch (tokenError) {
      console.error('[FCM] Error getting token:', tokenError);
      throw tokenError;
    }

    // Save token via API gateway -> notification-service
    console.log('[FCM] Saving device token to backend...');
    const saveResponse = await fetch('/api/notification/save-device-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token, platform: 'web' })
    });

    if (!saveResponse.ok) {
      throw new Error(`Failed to save token: ${saveResponse.status} ${saveResponse.statusText}`);
    }
    console.log('[FCM] Device token saved successfully');

    // Foreground message handler - both browser notification and in-app callback
    onMessage(messaging, (payload) => {
      try {
        console.log('[FCM] Foreground message received:', payload);
        const n = payload?.notification;
        if (n?.title) {
          // Browser notification (if permission granted)
          try {
            if (Notification.permission === 'granted') {
              new Notification(n.title, { body: n.body || '', icon: n.icon || '/favicon.ico' });
            }
          } catch (notifErr) {
            console.warn('[FCM] Browser notification error:', notifErr);
          }
          // In-app callback for UI panel (always call this)
          if (onNotificationReceived) {
            onNotificationReceived({ title: n.title, body: n.body || '' });
          }
        } else {
          console.warn('[FCM] Message received but no notification field:', payload);
        }
      } catch (e) {
        console.warn('[FCM] onMessage error:', e);
      }
    });

    console.log('[FCM] ✅ Successfully registered push notifications for user:', userId, 'Token:', token.slice(0, 20) + '...');
  } catch (e) {
    console.error('[FCM] ❌ Registration failed with error:', e);
    console.error('[FCM] Error details:', {
      message: (e as Error)?.message,
      stack: (e as Error)?.stack,
      error: e
    });
  }
}
