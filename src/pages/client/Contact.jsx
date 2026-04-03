import React from 'react';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

const Contact = () => {
  return (
    <div className="pt-32 pb-24 bg-[#fafaf9] min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-16">
          <span className="text-[10px] font-bold tracking-[0.4em] text-primary-600 uppercase mb-4 block underline decoration-primary-500 decoration-2 underline-offset-4">Support</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-secondary tracking-tighter uppercase italic leading-none">
            Nous <span className="text-primary-500 underline decoration-black/5 decoration-8 underline-offset-8">CONTACTER</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <a
            href="https://wa.me/22892721373"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-10 shadow-sm group hover:shadow-md transition-shadow border-l-4 border-green-400"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-50 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-lg font-display font-bold uppercase italic tracking-tight text-secondary">WhatsApp</h2>
            </div>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-500">
              +228 92 72 13 73
            </p>
            <p className="text-[10px] tracking-widest text-gray-400 mt-2 uppercase font-bold">
              Réponse sous 1h • Lun–Sam
            </p>
            <span className="mt-6 block text-[10px] font-bold tracking-widest uppercase text-green-500 group-hover:underline">
              Ouvrir WhatsApp →
            </span>
          </a>

          <a
            href="mailto:contact@mystikdrinks.com"
            className="bg-white p-10 shadow-sm group hover:shadow-md transition-shadow border-l-4 border-primary-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-500/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-500" />
              </div>
              <h2 className="text-lg font-display font-bold uppercase italic tracking-tight text-secondary">Email</h2>
            </div>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-500">
              contact@mystikdrinks.com
            </p>
            <p className="text-[10px] tracking-widest text-gray-400 mt-2 uppercase font-bold">
              Réponse sous 24h ouvrées
            </p>
            <span className="mt-6 block text-[10px] font-bold tracking-widest uppercase text-primary-500 group-hover:underline">
              Envoyer un Email →
            </span>
          </a>
        </div>

        <div className="bg-white p-10 shadow-sm mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary-500/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-500" />
            </div>
            <h2 className="text-lg font-display font-bold uppercase italic tracking-tight text-secondary">Notre adresse</h2>
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 leading-relaxed">
            Afrik Select – Be Pa de Souza, Lomé, Togo<br />
            RCCM TG-LFW-01-2024-A-10-04869
          </p>
        </div>

        <div className="bg-secondary text-white p-10 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary-400 mb-4">Horaires d'assistance</p>
          <p className="text-sm font-bold italic opacity-70">
            Lundi – Samedi : 08h00 – 20h00<br />
            <span className="text-xs opacity-50">Dimanche : uniquement via WhatsApp</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
