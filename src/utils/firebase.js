import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// TODO: Remplacer ces valeurs par celles de votre projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDrDVCQ6NUD3EYLHTZqBz7ly_qcHXte3Do",
  authDomain: "mystikdrinks.firebaseapp.com",
  projectId: "mystikdrinks",
  storageBucket: "mystikdrinks.firebasestorage.app",
  messagingSenderId: "651677416789",
  appId: "1:651677416789:web:2fb4396cec6932d93843dc"
};

// Seule la configuration est initialisée
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Enregistrement manuel du Service Worker pour s'assurer que Vite/React le trouve bien
      let registration = null;
      if ('serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
      }
      
      const token = await getToken(messaging, { 
         vapidKey: "BOmOzPQLUnPILR_9Ug7Nk1bYFvm_uTlOI9m2B2-O2s2sNis6RU8E9cIg28v3_x_DyZoF_aQp-Bz25KKH0ExQG5E",
         serviceWorkerRegistration: registration
      });
      
      if (token) {
        console.log('FCM Token généré:', token);
        // Sauvegarde automatique dans Firestore pour l'usage par l'API Notify
        try {
            await setDoc(doc(db, 'settings', 'notifications'), {
                adminToken: token,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log('Token persisté dans Firestore.');
        } catch (dbErr) {
            console.error('Erreur sauvegarde token Firestore:', dbErr);
        }
      }
      return token;
    } else {
      console.log('Permission refusée');
    }
  } catch (error) {
    console.error('Erreur configuration FCM :', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging, db, storage };
