import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Lock, Save, Bell } from 'lucide-react';
import { requestNotificationPermission } from '../../utils/firebase';

const Settings = () => {
  const [password, setPassword] = useState('');
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [fcmStatus, setFcmStatus] = useState('Non configuré');
  const [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    const currentParam = localStorage.getItem('mystikPassword') || 'mystik2024';
    const enabledParam = localStorage.getItem('mystikPasswordEnabled');

    
    setPassword(currentParam);
    if (enabledParam !== null) {
      setIsPasswordEnabled(enabledParam === 'true');
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      setFcmStatus('Activé');
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('mystikPassword', password);
    localStorage.setItem('mystikPasswordEnabled', isPasswordEnabled.toString());

    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEnableFCM = async () => {
    if (fcmStatus === 'Activé') return;
    setFcmStatus('Demande en cours...');
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmStatus('Activé');
        setFcmToken(token);
      } else {
        setFcmStatus('Refusé ou erreur');
      }
    } catch (err) {
      setFcmStatus('Erreur');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-secondary uppercase italic">Paramètres</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">
            Configuration de la console locale
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 border-none shadow-xl rounded-none relative overflow-hidden bg-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-50 flex items-center justify-center text-amber-500">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tighter text-secondary italic">Code d'accès</h2>
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Sécurité de la console</p>
            </div>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-secondary tracking-widest uppercase mb-2">
                Nouveau Code / Mot de passe
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!isPasswordEnabled}
                className="w-full px-4 py-3 border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors rounded-none disabled:bg-gray-100 disabled:text-gray-400"
                placeholder="Ex: mystik2024"
                required={isPasswordEnabled}
              />
              <p className="text-[10px] text-gray-400 mt-2 font-bold tracking-widest uppercase">
                Ce code sera demandé à la page /login
              </p>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPasswordEnabled}
                onChange={(e) => setIsPasswordEnabled(e.target.checked)}
                className="w-4 h-4 text-primary-500 accent-primary-500 rounded-none border-gray-300 focus:ring-primary-500"
              />
              <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                Activer la protection par mot de passe
              </span>
            </label>

            <Button type="submit" className="w-full bg-secondary text-white hover:bg-black rounded-none">
              <Save className="w-4 h-4 mr-2" />
              SAUVEGARDER
            </Button>
            {saved && (
              <p className="text-green-600 text-[10px] font-bold tracking-[0.2em] uppercase text-center animate-pulse">
                Modifications enregistrées !
              </p>
            )}
          </form>
        </Card>

        {/* Bloc préparatoire FCM */}
        <Card className="p-8 border-none shadow-xl rounded-none relative overflow-hidden bg-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 flex items-center justify-center text-blue-500">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tighter text-secondary italic">Notifications Admin</h2>
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Alertes de commandes</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <p className="text-xs font-bold leading-relaxed text-gray-500 uppercase tracking-widest text-justify">
              Activez les notifications sur ce navigateur pour être alerté instantanément de chaque nouvelle commande Mystik.
            </p>
            
            <div className="p-6 border border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Statut actuel</p>
                <p className={`text-xs font-black uppercase tracking-widest ${fcmStatus === 'Activé' ? 'text-green-600' : 'text-secondary'}`}>
                  {fcmStatus}
                </p>
              </div>
              
              <div className={`w-3 h-3 rounded-full ${fcmStatus === 'Activé' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            </div>

            <Button 
                onClick={handleEnableFCM}
                className={`w-full rounded-none font-black text-[11px] uppercase tracking-widest py-4 ${
                  fcmStatus === 'Activé' 
                    ? 'bg-gray-100 text-gray-400 cursor-default' 
                    : 'bg-secondary text-white hover:bg-black'
                }`}>
              {fcmStatus === 'Activé' ? 'Notifications Activées' : 'Activer les notifications'}
            </Button>
            
            {fcmStatus === 'Activé' && (
              <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest italic">
                Cet appareil recevra les alertes push
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
