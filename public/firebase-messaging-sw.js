importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// TODO: Remplacer ces valeurs par celles de votre projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrDVCQ6NUD3EYLHTZqBz7ly_qcHXte3Do",
  authDomain: "mystikdrinks.firebaseapp.com",
  projectId: "mystikdrinks",
  storageBucket: "mystikdrinks.firebasestorage.app",
  messagingSenderId: "651677416789",
  appId: "1:651677416789:web:2fb4396cec6932d93843dc"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Notification reçue en background: ', payload);
    const notificationTitle = payload.notification?.title || 'Mystik';
    const notificationOptions = {
      body: payload.notification?.body || 'Nouvelle notification !',
      icon: '/images/mystik/logo mystik.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log('Firebase config not initialized yet.');
}
