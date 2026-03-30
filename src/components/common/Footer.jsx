import React from 'react';
import { Camera, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-gray-400 py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <img src="/images/mystik/logo mystik black.png" alt="Logo Mystik" className="w-12 h-12 object-contain" />
              <h2 className="text-2xl font-display font-bold text-white tracking-tight uppercase italic text-primary-500">
                MYSTIK<span className="text-white">.</span>
              </h2>
            </div>
            <p className="max-w-xs text-[10px] font-bold tracking-widest uppercase mb-4 opacity-50 underline decoration-primary-500 decoration-2 underline-offset-4">Mystik - Legend's drink</p>
            <p className="max-w-xs text-sm leading-relaxed mb-6 italic opacity-70">
              Découvrez l’Esprit Authentique de Nos Terres. L'excellence du Sodabi Togolais, distillé avec passion.
              <br /><span className="text-xs font-bold mt-2 inline-block">Made in TOGO 🇹🇬</span>
            </p>
            <div className="flex space-x-4">
              <Camera className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
              <MessageCircle className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-6">EXPLORER</h4>
            <ul className="space-y-3 text-xs font-medium tracking-wider">
              <li><a href="#" className="hover:text-white transition-colors">NOS BOISSONS</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NOTRE ENGAGEMENT</a></li>
              <li><a href="#" className="hover:text-white transition-colors">POINTS DE VENTE</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-6">AIDE</h4>
            <ul className="space-y-3 text-xs font-medium tracking-wider">
              <li><a href="#" className="hover:text-white transition-colors">LIVRAISON</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NOUS CONTACTER</a></li>
              <li><a href="#" className="hover:text-white transition-colors">CGV</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.2em] font-bold uppercase">
          <p>© 2026 MYSTIK BRAND. TOUS DROITS RÉSERVÉS.</p>
          <p className="mt-4 md:mt-0 italic">Powered by FlowKraft Agency</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
