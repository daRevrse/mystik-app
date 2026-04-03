import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Lock, Save, Bell, Ticket, Trash2, Plus, Percent, Wallet } from 'lucide-react';
import { api } from '../../services/api';
import { requestNotificationPermission } from '../../utils/firebase';

const Settings = () => {
  const [password, setPassword] = useState('');
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [fcmStatus, setFcmStatus] = useState('Non configuré');
  const [fcmToken, setFcmToken] = useState('');
  
  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState([]);
  const [newPromo, setNewPromo] = useState({ id: '', discountType: 'percentage', discountValue: 0, isActive: true });
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoError, setPromoError] = useState('');

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

    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const data = await api.getPromoCodes();
      setPromoCodes(data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleAddPromo = async (e) => {
    e.preventDefault();
    if (!newPromo.id) return;
    
    setLoadingPromos(true);
    setPromoError('');
    try {
      await api.updatePromoCode(newPromo);
      setNewPromo({ id: '', discountType: 'percentage', discountValue: 0, isActive: true });
      fetchPromos();
    } catch (err) {
      setPromoError("Erreur lors de la création du code.");
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleDeletePromo = async (id) => {
    if (window.confirm(`Confirmer la suppression du code ${id} ?`)) {
      try {
        await api.deletePromoCode(id);
        fetchPromos();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const togglePromoStatus = async (promo) => {
    try {
      await api.updatePromoCode({ ...promo, isActive: !promo.isActive });
      fetchPromos();
    } catch (err) {
      alert("Erreur de mise à jour");
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

      {/* Marketing Section - Promo Codes */}
      <h2 className="text-2xl font-display font-bold text-secondary uppercase italic mt-12 flex items-center gap-3">
        <Ticket className="w-6 h-6 text-amber-500" />
        Marketing & Promotions
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* Formulaire Création */}
        <Card className="p-8 border-none shadow-xl rounded-none bg-white">
          <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
            Nouveau Code Promo
          </h3>
          <form onSubmit={handleAddPromo} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Code (ex: MYSTIK10)</label>
              <input
                type="text"
                value={newPromo.id}
                onChange={(e) => setNewPromo({ ...newPromo, id: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-200 focus:border-amber-500 outline-none rounded-none font-bold uppercase tracking-widest text-xs"
                placeholder="MYSTIK-LOMÉ"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Type</label>
                <select
                  value={newPromo.discountType}
                  onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-amber-500 outline-none rounded-none text-xs font-bold uppercase"
                >
                  <option value="percentage">Pourcentage %</option>
                  <option value="fixed">Montant fixe CFA</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Valeur</label>
                <input
                  type="number"
                  value={newPromo.discountValue}
                  onChange={(e) => setNewPromo({ ...newPromo, discountValue: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-amber-500 outline-none rounded-none font-bold text-xs"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loadingPromos}
              className="w-full bg-amber-500 text-white hover:bg-black rounded-none mt-4 font-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              CRÉER LE CODE
            </Button>
            {promoError && <p className="text-red-500 text-[10px] font-bold uppercase text-center mt-2">{promoError}</p>}
          </form>
        </Card>

        {/* Liste des codes */}
        <div className="lg:col-span-2 space-y-4">
          {promoCodes.length === 0 ? (
            <div className="bg-white p-12 text-center border-2 border-dashed border-gray-100 italic text-gray-400 font-bold uppercase tracking-widest text-xs">
              Aucun code promotionnel actif
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promoCodes.map((promo) => (
                <Card key={promo.id} className={`p-6 border-none shadow-lg rounded-none transition-all ${promo.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${promo.isActive ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'}`}>
                        {promo.discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-secondary tracking-tighter uppercase italic">{promo.id}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {promo.discountType === 'percentage' ? `-${promo.discountValue}%` : `-${promo.discountValue} FCFA`}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => togglePromoStatus(promo)}
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${promo.isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-200'}`}
                    >
                      {promo.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => handleDeletePromo(promo.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
