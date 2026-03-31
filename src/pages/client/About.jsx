import React, { useEffect } from 'react';
import { Leaf, Award, MapPin } from 'lucide-react';
import Badge from '../../components/ui/Badge';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#fafaf9] min-h-screen pb-32">
      {/* Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/mystik/groupe de liqueurs 2.webp" 
            className="w-full h-full object-cover opacity-40 scale-105 transform hover:scale-100 transition-transform duration-[10s]"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-transparent" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center animate-slide-up mt-10">
          <Badge variant="primary" className="mb-8 px-5 py-2 border border-primary-500/30 bg-primary-500/10 text-primary-400 font-bold tracking-[0.3em] uppercase backdrop-blur-sm">
            Notre Héritage
          </Badge>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-white mb-6 tracking-tighter uppercase italic leading-[0.85]">
            La Légende <br />
            <span className="text-primary-500 underline decoration-white/10 decoration-8 underline-offset-[16px]">Mystik.</span>
          </h1>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-32 max-w-4xl mx-auto px-6">
        <div className="text-center mb-32 animate-fade-in relative">
          <div className="absolute left-1/2 -top-20 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-primary-500 to-transparent"></div>
          
          <img src="/images/mystik/logo mystik.png" alt="Mystik Logo" className="w-20 h-20 mx-auto mb-10 opacity-60 grayscale" />
          
          <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary italic mb-10 uppercase leading-none tracking-tighter">
            Au cœur du Togo, <br/><span className="text-primary-600 font-sans tracking-tight">l'essence</span> d'une tradition ancestrale.
          </h2>
          <p className="text-gray-500 md:text-lg leading-loose font-bold opacity-80 uppercase tracking-widest text-justify md:text-center mt-12 bg-white/50 p-10 shadow-lg border border-gray-100">
            Le Sodabi n'est pas qu'une simple liqueur. C'est l'esprit festif, le remède et le lien spirituel des peuples du Golfe de Guinée. Mystik Legend's Drink est né d'une volonté absolue : redonner ses lettres de noblesse à cet alcool de palme traditionnel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-32">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -left-10 top-0 w-2 h-full bg-primary-500/20 hidden md:block"></div>
            <h3 className="text-3xl font-display font-bold text-secondary uppercase italic mb-8 tracking-tighter">L'Alchimie Togolaise.</h3>
            <p className="text-gray-500 text-xs leading-[2.5] font-bold opacity-80 uppercase tracking-widest mb-8 text-justify">
              Chaque bouteille de Mystik est le fruit d'une sélection rigoureuse des meilleurs vins de palme togolais. Distillé selon un savoir-faire gardé jalousement par nos ancêtres, notre Sodabi est ensuite affiné et macéré avec passion.
            </p>
            <p className="text-gray-500 text-xs leading-[2.5] font-bold opacity-80 uppercase tracking-widest text-justify border-l-2 border-primary-500 pl-6 bg-white p-6 shadow-sm">
              Qu'il s'agisse de notre Ananas tropical cultivé sous le soleil ardent de l'Afrique de l'Ouest, de notre gingembre bio ou de nos racines médicinales, chaque ingrédient est 100% naturel.
            </p>
          </div>
          <div className="order-1 md:order-2 aspect-[3/4] overflow-hidden bg-white shadow-2xl p-4 skew-y-2 transform-gpu hover:skew-y-0 transition-transform duration-700">
            <div className="w-full h-full relative overflow-hidden">
               <img src="/images/mystik/Ingredients Mystik.png" alt="Ingrédients Mystik" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s] origin-center scale-110 hover:scale-100" />
               <div className="absolute inset-0 border border-white/50 m-4 pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
          <div className="group p-10 bg-white hover:bg-secondary transition-all duration-500 shadow-xl shadow-gray-200/50 border border-gray-100 relative">
            <div className="w-16 h-16 bg-primary-500/10 rounded-none flex items-center justify-center mb-8 group-hover:bg-primary-500/20 transition-colors">
               <MapPin className="w-8 h-8 text-primary-500 stroke-[1.5px] group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xl font-display font-bold uppercase tracking-tighter mb-4 text-secondary group-hover:text-white transition-colors italic">Terroir Togolais</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-400 leading-relaxed transition-colors">
              Cultures locales, respect de la terre et soutien direct à nos agriculteurs togolais sans intermédiaires.
            </p>
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary-500 group-hover:w-full transition-all duration-700"></div>
          </div>
          
          <div className="group p-10 bg-white hover:bg-secondary transition-all duration-500 shadow-xl shadow-gray-200/50 border border-primary-100 relative md:-translate-y-8">
            <div className="absolute top-0 right-0 bg-primary-500 text-secondary text-[9px] font-bold px-4 py-2 uppercase tracking-[0.3em]">Signature</div>
            <div className="w-16 h-16 bg-primary-500/10 rounded-none flex items-center justify-center mb-8 group-hover:bg-primary-500/20 transition-colors">
               <Award className="w-8 h-8 text-primary-500 stroke-[1.5px] group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xl font-display font-bold uppercase tracking-tighter mb-4 text-secondary group-hover:text-white transition-colors italic">Qualité Premium</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-400 leading-relaxed transition-colors">
              Une triple distillation garantissant une pureté absolue et une douceur surprenante en bouche.
            </p>
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary-500 group-hover:w-full transition-all duration-700"></div>
          </div>
          
          <div className="group p-10 bg-white hover:bg-secondary transition-all duration-500 shadow-xl shadow-gray-200/50 border border-gray-100 relative">
            <div className="w-16 h-16 bg-primary-500/10 rounded-none flex items-center justify-center mb-8 group-hover:bg-primary-500/20 transition-colors">
               <Leaf className="w-8 h-8 text-primary-500 stroke-[1.5px] group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xl font-display font-bold uppercase tracking-tighter mb-4 text-secondary group-hover:text-white transition-colors italic">100% Naturel</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-400 leading-relaxed transition-colors">
              Zéro arôme artificiel. L'expression pure des fruits et racines de notre beau continent.
            </p>
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary-500 group-hover:w-full transition-all duration-700"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
