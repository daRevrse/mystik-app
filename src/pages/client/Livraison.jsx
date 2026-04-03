import React from 'react';
import { Truck, Clock, MapPin, AlertCircle } from 'lucide-react';

const Livraison = () => {
  return (
    <div className="pt-32 pb-24 bg-[#fafaf9] min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary-600 uppercase mb-4 block underline decoration-primary-500 decoration-2 underline-offset-4">Informations</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-secondary tracking-tighter uppercase italic leading-none">
            Politique de <span className="text-primary-500 underline decoration-black/5 decoration-8 underline-offset-8">LIVRAISON</span>
          </h1>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-500/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary-500" />
              </div>
              <h2 className="text-lg font-display font-bold uppercase italic tracking-tight text-secondary">Zone de livraison</h2>
            </div>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-500 leading-relaxed">
              Nous livrons actuellement dans les zones suivantes : <strong className="text-secondary">Lomé et ses environs</strong> (Grand Lomé, Agoe, Adidogomé, Bè, Tokoin, Hédzranawoé, Nukafu).
              Pour les commandes hors Lomé, veuillez nous contacter directement via WhatsApp.
            </p>
          </div>

          <div className="bg-white p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-500" />
              </div>
              <h2 className="text-lg font-display font-bold uppercase italic tracking-tight text-secondary">Délais de livraison</h2>
            </div>
            <ul className="space-y-3 text-xs font-bold tracking-widest uppercase text-gray-500">
              <li className="flex items-start gap-3">
                <span className="text-primary-500 mt-0.5">→</span>
                <span>Commandes passées avant 14h : livraison le jour même</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-500 mt-0.5">→</span>
                <span>Commandes passées après 14h : livraison le lendemain</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-500 mt-0.5">→</span>
                <span>Délai indicatif : 24 à 48h en zones périphériques</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-500/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-500" />
              </div>
              <h2 className="text-lg font-display font-bold uppercase italic tracking-tight text-secondary">Frais de livraison</h2>
            </div>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-500 leading-relaxed">
              Les frais de livraison sont <strong className="text-secondary">à la charge du client</strong> et sont réglés directement au livreur à la réception de la commande. Le montant varie selon la distance et sera communiqué par notre équipe au moment de la confirmation.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-8 flex gap-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-700 leading-relaxed">
              Veuillez vous assurer d'être joignable au numéro indiqué lors de la commande pour faciliter la livraison. Toute commande non récupérée après 2 tentatives sera annulée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Livraison;
