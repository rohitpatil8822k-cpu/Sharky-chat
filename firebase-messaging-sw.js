
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

// Firebase config (tere project ka same)
firebase.initializeApp({
  apiKey: "AIzaSyBGfgy9OeMTJ__oOAFxoBW-eIOYlvhObZM",
  authDomain: "sharky-chat-007.firebaseapp.com",
  projectId: "sharky-chat-007",
  storageBucket: "sharky-chat-007.appspot.com",
  messagingSenderId: "637104796242",
  appId: "1:637104796242:web:74ac36b86af91be15ea58b",
  measurementId: "G-HT9T3P9KST",
});

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

console.log('[Sharky FCM] Service Worker loaded');

// Background message handler (jab browser band/tab closed ho)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Notification title aur body Firebase console se aayega
  const notificationTitle = payload.notification?.title || '🦈 Sharky Chat';
  const notificationOptions = {
    body: payload.notification?.body || 'New notification received',
    icon: 'https://firebasestorage.googleapis.com/v0/b/sharky-chat-007.firebasestorage.app/o/gc-logo.png?alt=media&token=ddfe6e46-7351-4a07-8140-ea702b1bd823', // tera logo
    badge: 'https://firebasestorage.googleapis.com/v0/b/sharky-chat-007.firebasestorage.app/o/gc-logo.png?alt=media&token=ddfe6e46-7351-4a07-8140-ea702b1bd823',
    image: payload.notification?.image || null,
    tag: 'sharky-notification',
    requireInteraction: true, // notification dismiss nahi hoga auto
    vibrate: [200, 100, 200], // mobile vibration
    data: {
      url: payload.fcmOptions?.link || '/chatrooms.html', // click karne pe yahan redirect
      type: payload.data?.type || 'general',
      ...payload.data
    },
    actions: [
      {
        action: 'open',
        title: 'Open Sharky',
        icon: 'https://firebasestorage.googleapis.com/v0/b/sharky-chat-007.firebasestorage.app/o/gc-logo.png?alt=media&token=ddfe6e46-7351-4a07-8140-ea702b1bd823'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGxpbmUgeDE9IjE4IiB5MT0iNiIgeDI9IjYiIHkyPSIxOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxsaW5lIHgxPSI2IiB5MT0iNiIgeDI9IjE4IiB5Mj0iMTgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K'
      }
    ]
  };

  // Notification show karo
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Sharky FCM] Notification clicked:', event);
  
  event.notification.close();

  // Action buttons handle karo
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'dismiss') {
    // Nothing, just close
  } else {
    // Default click → app open
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Agar koi tab already open hai to focus karo
        for (let client of clientList) {
          if (client.url.includes('sharky-chat') && 'focus' in client) {
            return client.focus();
          }
        }
        // Naya tab kholo
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
    );
  }
});

// Notification close handler (optional)
self.addEventListener('notificationclose', (event) => {
  console.log('[Sharky FCM] Notification closed:', event);
});


