importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAiKgwAqCptCiWh3xG2DgIRdnOy9dlt3Ww",
  authDomain: "our-little-universe-73207.firebaseapp.com",
  projectId: "our-little-universe-73207",
  storageBucket: "our-little-universe-73207.firebasestorage.app",
  messagingSenderId: "446105820889",
  appId: "1:446105820889:web:8a2222ee8429b3d92da8c8"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  const n = payload.notification || {};
  self.registration.showNotification(n.title || "our little universe", {
    body: n.body || "Naya message 💌",
    icon: "icon-192.png"
  });
});
