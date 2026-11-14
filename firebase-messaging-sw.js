/* Firebase Cloud Messaging service worker for Our Little Universe. */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAiKgwAqCptCiWh3xG2DgIRdnOy9dlt3Ww',
  authDomain: 'our-little-universe-73207.firebaseapp.com',
  projectId: 'our-little-universe-73207',
  storageBucket: 'our-little-universe-73207.firebasestorage.app',
  messagingSenderId: '446105820889',
  appId: '1:446105820889:web:8a2222ee8429b3d92da8c8'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || 'Our Little Universe 💌';
  const options = {
    body: notification.body || 'Aapke liye ek naya message hai.',
    tag: data.messageId || 'our-little-universe-chat',
    renotify: true,
    data: { url: './', ...data }
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = new URL('./', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        if ('navigate' in client) await client.navigate(targetUrl);
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(targetUrl);
  })());
});
