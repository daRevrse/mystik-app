import React, { useEffect, useState } from 'react';
import { requestNotificationPermission } from '../../utils/firebase';
import { Bell, X } from 'lucide-react';

const PWAInitializer = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Vérifie si on a déjà demandé ou si c'est déjà activé
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const hasPrompted = localStorage.getItem('mystik_pwa_prompted');
    const isSupported = 'Notification' in window;
    
    // Si pas admin, on ne montre rien
    if (!isAdmin) return;
    
    if (isSupported && Notification.permission === 'default' && !hasPrompted) {
      // Attendre 5 secondes après le chargement pour ne pas agresser l'utilisateur
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    localStorage.setItem('mystik_pwa_prompted', 'true');
    setShowPrompt(false);
    try {
      await requestNotificationPermission();
    } catch (err) {
      console.error('Permission denied or error:', err);
    }
  };

  const handleClose = () => {
    localStorage.setItem('mystik_pwa_prompted', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[9999] animate-fade-in italic-none">
      <div className="bg-secondary text-white p-6 shadow-2xl relative overflow-hidden border border-white/5">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rotate-45 translate-x-12 -translate-y-12" />
        
        <div className="flex gap-5 relative z-10">
          <div className="w-12 h-12 bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Bell className="w-6 h-6 text-secondary" />
          </div>
          
          <div className="flex-grow">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white mb-1 italic">
              Restez Connecté
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed mb-4">
              Activez les notifications pour recevoir vos alertes de commande et nos exclusivités Mystik en temps réel.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleEnable}
                className="flex-grow bg-amber-500 hover:bg-amber-600 text-secondary py-3 px-4 font-black text-[9px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Activer les alertes
              </button>
              <button 
                onClick={handleClose}
                className="bg-white/5 hover:bg-white/10 text-white py-3 px-4 font-black text-[9px] uppercase tracking-widest transition-all"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInitializer;
