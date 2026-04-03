import React, { useEffect } from 'react';
import { requestNotificationPermission } from '../../utils/firebase';

/**
 * AdminNotificationManager
 * Composant invisible s'assurant que l'appareil de l'administrateur
 * reste enregistré dans Firestore à chaque session.
 */
const AdminNotificationManager = () => {
  useEffect(() => {
    const refreshRegistration = async () => {
      // Uniquement si authentifié admin
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (!isAdmin) return;

      // Uniquement si les notifications sont déjà autorisées
      // On évite de forcer une demande de permission ici (PWAInitializer s'en charge)
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          console.log('[NOTIFICATION MANAGER] Rafraîchissement connection...');
          const token = await requestNotificationPermission();
          if (token) {
            console.log('[NOTIFICATION MANAGER] Appareil synchronisé.');
          }
        } catch (err) {
          console.error('[NOTIFICATION MANAGER] Erreur lors du rafraîchissement:', err);
        }
      }
    };

    // Petit délai pour ne pas ralentir le chargement initial
    const timer = setTimeout(refreshRegistration, 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default AdminNotificationManager;
