import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { api } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft, Trash2, CreditCard, Truck, ChevronRight, ShoppingCart, Minus, Plus, Phone, Ghost, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, removeItem, updateQuantity, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: 'Lomé',
    zipCode: '',
    phone: ''
  });

  const [wantsDelivery, setWantsDelivery] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  const cartTotal = getCartTotal();
  const deliveryFee = parseInt(localStorage.getItem('mystikDeliveryFee') || '2000');
  const grandTotal = cartTotal + (wantsDelivery ? deliveryFee : 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    if (!selectedNetwork) {
       alert("Veuillez sélectionner un réseau mobile (T-Money ou Flooz) pour procéder au paiement.");
       return;
    }

    setLoading(true);
    const transactionId = Math.floor(Math.random() * 100000000).toString();

    // 1. SIMULATION PAIEMENT (En attendant Paygate Global réel)
    console.log("Simulation du paiement via", selectedNetwork);
    
    setTimeout(async () => {
        try {
            const orderData = {
              customer: formData,
              items,
              total: grandTotal,
              transaction_id: transactionId,
              payment_status: 'Payé', // Statut simulé
              payment_network: selectedNetwork,
              delivery_requested: wantsDelivery,
              date: new Date().toISOString()
            };
            
            const newOrder = await api.createOrder(orderData);
            
            // [NOUVEAU] Appel du Backend Vercel pour envoyer une Notification Push (FCM v1)
            try {
               await fetch('/api/notify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     title: `🔥 Nouvelle Commande (${formatPrice(grandTotal)})`,
                     body: `Client: ${formData.firstName} ${formData.lastName} | Paiement: ${selectedNetwork}`,
                     token: localStorage.getItem('mystikAdminFCMToken') // Récupéré pour les tests locaux (même PC)
                  })
               });
            } catch (pushErr) {
               console.warn("Échec requête Push Admin:", pushErr);
            }

            clearCart();
            navigate('/success', { state: { order: newOrder } });
        } catch (error) {
            console.error("Erreur enregistrement commande", error);
            alert("La simulation a fonctionné mais l'enregistrement local a échoué.");
            setLoading(false);
        }
    }, 2500); // 2.5 secondes d'attente
  };

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-24 min-h-screen text-center bg-[#fafaf9] flex flex-col items-center justify-center animate-fade-in">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-10 shadow-xl border border-gray-100">
          <ShoppingCart className="w-10 h-10 text-primary-500" />
        </div>
        <h2 className="text-4xl font-display font-bold text-secondary mb-4 uppercase italic leading-none">Votre panier de légende est vide.</h2>
        <p className="text-gray-400 mb-12 max-w-sm mx-auto text-[10px] font-bold tracking-[0.3em] italic opacity-70 uppercase leading-relaxed">DÉCOUVREZ L'AME DE NOS TERRES DANS NOTRE CATALOGUE.</p>
        <Link to="/">
          <Button variant="primary" className="px-16 py-5 btn-primary">VOIR LA COLLECTION</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-[#fafaf9] min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary-600 uppercase mb-4 block underline decoration-primary-500 decoration-2 underline-offset-4">Étape Finale</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-secondary tracking-tighter uppercase italic leading-none">
            Finaliser ma <span className="text-primary-500 underline decoration-black/5 decoration-8 underline-offset-8">COMMANDE</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-12 animate-fade-in">
            <Card className="p-10 border-none shadow-sm shadow-gray-200/50 bg-white">
              <div className="flex items-center mb-10 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center text-sm font-bold mr-6">01</div>
                <h3 className="text-2xl font-display font-bold italic tracking-tight uppercase">Adresse de livraison</h3>
              </div>

              <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-2">Prénom</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Koffi" className="w-full bg-white border-transparent border-b-2 border-b-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-b-primary-500 transition-all font-bold tracking-widest uppercase italic placeholder:opacity-30" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-2">Nom</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Mensah" className="w-full bg-white border-transparent border-b-2 border-b-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-b-primary-500 transition-all font-bold tracking-widest uppercase italic placeholder:opacity-30" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-2">Numéro de téléphone (Togo 🇹🇬)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+228 90 00 00 00" className="w-full bg-white border-transparent border-b-2 border-b-gray-100 pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-b-primary-500 transition-all font-bold tracking-widest uppercase italic" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-2">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contact@email.com" className="w-full bg-white border-transparent border-b-2 border-b-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-b-primary-500 transition-all font-bold tracking-widest uppercase italic placeholder:opacity-30" />
                </div>
                <div className="md:col-span-2 space-y-4 pt-6 border-t border-gray-100 mt-4 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer group p-4 border border-gray-100 hover:border-amber-100 bg-[#fafaf9] transition-colors">
                    <input 
                       type="checkbox" 
                       checked={wantsDelivery} 
                       onChange={(e) => setWantsDelivery(e.target.checked)} 
                       className="w-5 h-5 text-primary-500 accent-primary-500 rounded-none border-gray-300" 
                    />
                    <div>
                        <span className="block text-sm font-bold text-secondary tracking-widest uppercase italic group-hover:text-primary-600 transition-colors">Je souhaite être livré (+ {formatPrice(deliveryFee)})</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed block mt-1">Si vous décochez, vous viendrez récupérer votre commande.</span>
                    </div>
                  </label>
                </div>

                {wantsDelivery && (
                  <>
                    <div className="md:col-span-2 space-y-2 animate-fade-in">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-2">Quartier / Adresse de résidence</label>
                      <input required={wantsDelivery} name="address" value={formData.address} onChange={handleInputChange} placeholder="Quartier Administratif, Rue 42" className="w-full bg-white border-transparent border-b-2 border-b-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-b-primary-500 transition-all font-bold tracking-widest uppercase italic placeholder:opacity-30" />
                    </div>
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-2">Ville</label>
                      <input required={wantsDelivery} name="city" value={formData.city} onChange={handleInputChange} placeholder="Lomé" className="w-full bg-white border-transparent border-b-2 border-b-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-b-primary-500 transition-all font-bold tracking-widest uppercase italic placeholder:opacity-30" />
                    </div>
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase ml-2">Zone (Optionnel)</label>
                      <input name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Maritime" className="w-full bg-white border-transparent border-b-2 border-b-gray-100 px-4 py-4 text-sm focus:outline-none focus:border-b-primary-500 transition-all font-bold tracking-widest uppercase italic placeholder:opacity-30" />
                    </div>
                  </>
                )}
              </form>
            </Card>

            <Card className="p-10 border-none shadow-sm shadow-gray-200/50 bg-white">
              <div className="flex items-center mb-10 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center text-sm font-bold mr-6">02</div>
                <h3 className="text-2xl font-display font-bold italic tracking-tight uppercase">Paiement & Sécurité</h3>
              </div>
              <div className="p-10 bg-[#fafaf9] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-6">
                <div className="flex space-x-6 justify-center w-full">
                  <button 
                      type="button" 
                      onClick={() => setSelectedNetwork('FLOOZ')}
                      className={`w-24 h-24 rounded-full overflow-hidden border-[6px] transition-all duration-300 shadow-xl ${selectedNetwork === 'FLOOZ' ? 'border-primary-500 scale-110 shadow-primary-500/30' : 'border-white hover:border-gray-200 opacity-50 hover:opacity-100'}`}>
                      <img src="/images/moov.jpg" alt="Flooz" className="w-full h-full object-cover" />
                  </button>
                  <button 
                      type="button" 
                      onClick={() => setSelectedNetwork('TMONEY')}
                      className={`w-24 h-24 rounded-full overflow-hidden border-[6px] transition-all duration-300 shadow-xl ${selectedNetwork === 'TMONEY' ? 'border-primary-500 scale-110 shadow-primary-500/30' : 'border-white hover:border-gray-200 opacity-50 hover:opacity-100'}`}>
                      <img src="/images/yas.jpg" alt="T-Money" className="w-full h-full object-cover" />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed italic opacity-80 max-w-sm mt-4">
                  {selectedNetwork 
                      ? <span className="text-primary-600 block mb-2 text-xs">Validation en cours : {selectedNetwork}</span>
                      : "Sélectionnez le compte Mobile Money qui sera débité pour votre commande."}
                  <br/>
                  (Mode Simulation PayGate Global Activé)
                </p>
              </div>
            </Card>
          </div>

          {/* Cart Summary Side */}
          <div className="lg:col-span-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="sticky top-32 space-y-12">
              <Card className="p-10 border-none shadow-2xl bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
                
                <h3 className="text-2xl font-display font-bold mb-10 uppercase italic border-b border-gray-50 pb-6 tracking-tight">Récapitulatif <span className="text-primary-500">Expresso</span></h3>
                
                <div className="space-y-8 max-h-[350px] overflow-auto pr-4 mb-10 scrollbar-hide">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-6 group">
                      <div className="w-24 h-24 overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm">
                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold uppercase italic leading-tight mb-1 max-w-[150px] tracking-widest">{item.name}</h4>
                          <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[8px] font-bold tracking-[0.3em] text-primary-500 italic mb-4 uppercase">{item.category}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center border border-gray-100 p-0.5 bg-white shadow-sm">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-secondary"><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-bold w-10 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-secondary"><Plus className="w-3 h-3" /></button>
                          </div>
                          <p className="text-sm font-bold italic">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-10 border-t border-gray-100">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase italic opacity-60">
                    <span>Sous-total Artisanal</span>
                    <span className="text-secondary">{formatPrice(cartTotal)}</span>
                  </div>
                  {wantsDelivery && (
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase italic opacity-60">
                      <span className="flex items-center">
                        Livraison Standard 🇹🇬
                        <Truck className="w-4 h-4 ml-3" />
                      </span>
                      <span className="text-secondary">{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-3xl font-display font-bold pt-8 text-secondary uppercase italic leading-none border-t border-gray-50 mt-4">
                    <span>Total</span>
                    <span className="text-primary-600 underline decoration-black/5 decoration-8 underline-offset-8">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <Button 
                  form="checkout-form" 
                  type="submit" 
                  size="lg" 
                  className={`w-full mt-12 py-6 btn-primary shadow-2xl font-display italic tracking-widest text-lg ${!selectedNetwork ? 'opacity-40 grayscale cursor-not-allowed hover:scale-100 hover:shadow-none' : 'shadow-primary-500/30'}`}
                  disabled={loading || !selectedNetwork}
                >
                  {loading ? 'SIMULATION EN COURS...' : !selectedNetwork ? 'SÉLECTIONNEZ UN PAIEMENT' : (
                    <span className="flex items-center justify-center">
                      COMMANDER VIA {selectedNetwork}
                      <ChevronRight className="ml-2 w-6 h-6" />
                    </span>
                  )}
                </Button>

                <div className="mt-10 pt-10 border-t border-gray-50 flex justify-center gap-10 opacity-30 grayscale saturate-0">
                  <ShieldCheck className="w-6 h-6" />
                  <Truck className="w-6 h-6" />
                  <Ghost className="w-6 h-6" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
