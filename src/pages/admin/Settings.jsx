import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Lock, Save, Bell } from 'lucide-react';
import { requestNotificationPermission } from '../../utils/firebase';

const Settings = () => {
  const [password, setPassword] = useState('');
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(2000);
  const [saved, setSaved] = useState(false);
  const [fcmStatus, setFcmStatus] = useState('Non configuré');

  useEffect(() => {
    const currentParam = localStorage.getItem('mystikPassword') || 'mystik2024';
    const enabledParam = localStorage.getItem('mystikPasswordEnabled');
    const feeParam = localStorage.getItem('mystikDeliveryFee');
    
    setPassword(currentParam);
    if (enabledParam !== null) {
      setIsPasswordEnabled(enabledParam === 'true');
    }
    if (feeParam !== null) {
      setDeliveryFee(parseInt(feeParam));
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('mystikPassword', password);
    localStorage.setItem('mystikPasswordEnabled', isPasswordEnabled.toString());
    localStorage.setItem('mystikDeliveryFee', deliveryFee.toString());
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEnableFCM = async () => {
    setFcmStatus('Demande en cours...');
    const token = await requestNotificationPermission();
    if (token) {
      setFcmStatus('Activé');
    } else {
      setFcmStatus('Refusé ou erreur');
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

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-bold text-secondary tracking-widest uppercase mb-2">
                Frais de livraison par Défaut (FCFA)
              </label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors rounded-none"
                placeholder="Ex: 2000"
                min="0"
                required
              />
              <p className="text-[10px] text-gray-400 mt-2 font-bold tracking-widest uppercase">
                Appliqué si le client choisit l'option livraison
              </p>
            </div>

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
              <h2 className="text-xl font-bold uppercase tracking-tighter text-secondary italic">Notifications FCM</h2>
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Alertes en temps réel</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <p className="text-xs font-bold leading-relaxed text-gray-500 uppercase tracking-widest text-justify">
              L'intégration Firebase est préparée. Une fois les clés configurées, vous pourrez activer les notifications push sur cet appareil.
            </p>
            <div className="p-4 bg-gray-50 border border-gray-100 italic">
               <span className="text-xs font-bold uppercase text-gray-400">Statut: </span>
               <span className="text-xs font-bold uppercase text-secondary ml-2">{fcmStatus}</span>
            </div>
            <Button 
                onClick={handleEnableFCM}
                variant="outline" 
                className="w-full border-gray-200 text-gray-500 hover:bg-gray-50 rounded-none">
              ACTIVER (Test Local)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
