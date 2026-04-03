import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { api } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft, Trash2, CreditCard, Truck, ChevronRight, ShoppingCart, Minus, Plus, Phone, Ghost, ShieldCheck, Lock } from 'lucide-react';

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
  const transactionFee = 0; // Mobile Money bientôt disponible
  const grandTotal = cartTotal + transactionFee; // Les frais de livraison sont à la charge du client à la réception

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
       alert("Veuillez sélectionner un mode de paiement pour procéder.");
       return;
    }

    // Seul COD est disponible actuellement
    if (selectedNetwork !== 'COD') {
       alert("Ce mode de paiement sera bientôt disponible. Veuillez choisir 'À la livraison'.");
       return;
    }

    setLoading(true);
    const transactionId = `MTK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
        let paymentStatus = 'Payé';
        let txRef = transactionId;

        // 1. GESTION DES MODES DE PAIEMENT
        if (selectedNetwork !== 'COD') {
            // APPEL RÉEL PAYGATE GLOBAL
            const paygateRes = await fetch('/api/paygate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: grandTotal,
                    orderId: transactionId,
                    phone: formData.phone,
                    network: selectedNetwork
                })
            });

            const paygateData = await paygateRes.json();

            if (!paygateRes.ok || !paygateData.success) {
                throw new Error(paygateData.error || "Échec de l'initialisation du paiement.");
            }
            txRef = paygateData.tx_reference || transactionId;
        } else {
            // CASH ON DELIVERY
            paymentStatus = 'Non Payé';
            txRef = 'Paiement à la livraison';
        }

        // 2. ENREGISTREMENT DE LA COMMANDE
        const orderData = {
          id: transactionId,
          customer: formData,
          items,
          total: grandTotal,
          transaction_id: txRef,
          paymentStatus: paymentStatus, 
          payment_network: selectedNetwork,
          delivery_requested: wantsDelivery,
          date: new Date().toISOString()
        };
        
        const newOrder = await api.createOrder(orderData);
        
        // 3. Notification Push Admin
        try {
           await fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 title: `🔥 ${selectedNetwork === 'COD' ? 'Nouvelle Facture' : 'Nouvelle Commande'} (${formatPrice(grandTotal)})`,
                 body: `Client: ${formData.firstName} ${formData.lastName} | Paiement: ${selectedNetwork === 'COD' ? 'À la livraison' : selectedNetwork}`,
                 token: localStorage.getItem('mystikAdminFCMToken') 
              })
           });
        } catch (pushErr) {
           console.warn("Échec requête Push Admin:", pushErr);
        }

        // 4. Envoi Email Copie (Simulé)
        try {
           await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 order: newOrder,
                 type: selectedNetwork === 'COD' ? 'invoice' : 'receipt'
              })
           });
        } catch (emailErr) {
           console.warn("Échec envoi email:", emailErr);
        }

        clearCart();
        navigate('/success', { state: { order: newOrder } });

    } catch (error) {
        console.error("Erreur Paiement/Commande:", error);
        alert(`ÉCHEC DE LA COMMANDE : \n${error.message}`);
        setLoading(false);
    }
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
                        <span className="block text-sm font-bold text-secondary tracking-widest uppercase italic group-hover:text-primary-600 transition-colors">Je souhaite être livré</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed block mt-1">Les frais de livraison sont à votre charge et à régler au livreur.</span>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  {/* Flooz - Bientôt disponible */}
                  <div className="relative flex flex-col items-center gap-3 p-4 rounded-xl bg-white/40 grayscale opacity-40 cursor-not-allowed">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="bg-secondary text-white text-[7px] font-bold tracking-widest uppercase px-2 py-0.5">Bientôt</span>
                    </div>
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-md">
                      <img src="/images/moov.jpg" alt="Flooz" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Flooz</span>
                  </div>

                  {/* T-Money - Bientôt disponible */}
                  <div className="relative flex flex-col items-center gap-3 p-4 rounded-xl bg-white/40 grayscale opacity-40 cursor-not-allowed">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="bg-secondary text-white text-[7px] font-bold tracking-widest uppercase px-2 py-0.5">Bientôt</span>
                    </div>
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-md">
                      <img src="/images/yas.jpg" alt="T-Money" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">T-Money</span>
                  </div>

                  {/* Carte Bancaire - Bientôt disponible */}
                  <div className="relative flex flex-col items-center gap-3 p-4 rounded-xl bg-white/40 grayscale opacity-40 cursor-not-allowed">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="bg-secondary text-white text-[7px] font-bold tracking-widest uppercase px-2 py-0.5">Bientôt</span>
                    </div>
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-md bg-gray-100 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Carte</span>
                  </div>

                  {/* COD - Disponible */}
                  <button 
                      type="button" 
                      onClick={() => setSelectedNetwork('COD')}
                      className={`relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300 shadow-sm ${selectedNetwork === 'COD' ? 'bg-white ring-4 ring-primary-500 scale-105' : 'bg-white/80 hover:bg-white hover:shadow-md'}`}>
                    {selectedNetwork === 'COD' && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="bg-primary-500 text-secondary text-[7px] font-bold tracking-widest uppercase px-2 py-0.5">Sélectionné</span>
                      </div>
                    )}
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-md bg-secondary text-white flex items-center justify-center">
                      <Truck className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">À la livraison</span>
                  </button>
                </div>

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed italic opacity-80 max-w-sm mt-4">
                  {selectedNetwork === 'COD' 
                      ? <span className="text-primary-600 block mb-2 text-xs">✓ Paiement à réception des bouteilles</span>
                      : <span>Seul le paiement à la livraison est disponible pour le moment.</span>}
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
                        Expédition locale
                        <Truck className="w-4 h-4 ml-3" />
                      </span>
                      <span className="text-primary-500">À votre charge</span>
                    </div>
                  )}
                  {transactionFee > 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase italic opacity-60 animate-fade-in">
                      <span>Frais de service mobile</span>
                      <span className="text-secondary">+{formatPrice(transactionFee)}</span>
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
                  {loading ? 'COMMANDE EN COURS...' : !selectedNetwork ? 'CHOISIR UN PAIEMENT' : (
                    <span className="flex items-center justify-center">
                      {selectedNetwork === 'COD' ? 'CONFIRMER LA COMMANDE' : `PAYER VIA ${selectedNetwork}`}
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
