import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';

const points = [
  {
    name: 'Boutique Mystik – Lomé Centre',
    address: 'Boulevard du 13 Janvier, Lomé',
    hours: 'Lun–Sam : 09h–20h',
    phone: '+228 90 00 00 00',
  },
  {
    name: 'Dépôt Adidogomé',
    address: 'Quartier Adidogomé, Route de Kpalimé, Lomé',
    hours: 'Lun–Sam : 08h–19h',
    phone: '+228 91 00 00 00',
  },
  {
    name: 'Point Relais Bè-Kpota',
    address: 'Marché de Bè-Kpota, Lomé Est',
    hours: 'Lun–Dim : 07h–21h',
    phone: '+228 92 00 00 00',
  },
];

const PointsDeVente = () => {
  return (
    <div className="pt-32 pb-24 bg-[#fafaf9] min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary-600 uppercase mb-4 block underline decoration-primary-500 decoration-2 underline-offset-4">Où nous trouver</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-secondary tracking-tighter uppercase italic leading-none">
            Points de <span className="text-primary-500 underline decoration-black/5 decoration-8 underline-offset-8">VENTE</span>
          </h1>
        </div>

        <div className="space-y-8">
          {points.map((p, i) => (
            <div key={i} className="bg-white p-10 shadow-sm border-l-4 border-primary-500">
              <h2 className="text-xl font-display font-bold uppercase italic tracking-tight text-secondary mb-4">{p.name}</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs font-bold tracking-widest uppercase text-gray-500">
                  <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{p.address}</span>
                </div>
                <div className="flex items-start gap-3 text-xs font-bold tracking-widest uppercase text-gray-500">
                  <Clock className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{p.hours}</span>
                </div>
                <div className="flex items-start gap-3 text-xs font-bold tracking-widest uppercase text-gray-500">
                  <Phone className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{p.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-10 bg-secondary text-white text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary-400 mb-4">Vous souhaitez devenir revendeur ?</p>
          <p className="text-sm font-bold italic opacity-70 mb-6">Contactez-nous pour rejoindre le réseau Mystik Legend's Drink.</p>
          <a
            href="https://wa.me/22892721373"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-primary-500 text-secondary text-xs font-bold tracking-[0.3em] uppercase hover:bg-white transition-colors"
          >
            Nous Contacter
          </a>
        </div>
      </div>
    </div>
  );
};

export default PointsDeVente;
