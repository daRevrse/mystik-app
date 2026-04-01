import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useCartStore } from '../../store/useCartStore';
import { ArrowRight, Star, Leaf, Ghost, Beer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const categories = ['Tous', 'Fruitée', 'Spéciale'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des produits", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeCategory === 'Tous') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, products]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/mystik/groupe de liqueurs 2.webp" 
            className="w-full h-full object-cover opacity-60 scale-105"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center animate-slide-up">
          <Badge variant="primary" className="mb-6 px-4 py-1.5 border border-primary-500/30 bg-primary-500/10 text-primary-400 font-bold tracking-[0.2em] uppercase">
            L'Esprit Authentique de Nos Terres
          </Badge>
          <h1 className="text-7xl md:text-9xl font-display font-bold text-white mb-8 tracking-tighter leading-[0.85] uppercase italic">
            MYSTIK<br />
            <span className="text-5xl md:text-7xl text-primary-500 underline decoration-white/20 decoration-8 underline-offset-8">LEGEND'S DRINK.</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-bold italic opacity-90 tracking-wide uppercase">
            Découvrez l'excellence du Sodabi Togolais. Une liqueur premium distillée avec passion et tradition.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Button size="lg" className="w-full md:w-auto px-12 py-6 bg-primary-500 text-secondary" onClick={() => document.getElementById('catalogue').scrollIntoView({ behavior: 'smooth' })}>
              ACHETER MAINTENANT
            </Button>
            <Button 
               variant="outline" 
               size="lg" 
               className="w-full md:w-auto border-white text-white hover:bg-white hover:text-secondary group px-12 py-6"
               onClick={() => navigate('/about')}
            >
              NOTRE HISTOIRE
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/30 animate-pulse">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2 italic">Explorer</span>
          <div className="w-[1px] h-12 bg-primary-500" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#0a0a0a] text-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-primary-500/10 rounded-full border border-primary-500/20 flex items-center justify-center mx-auto text-primary-500">
                <Star className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold font-serif uppercase tracking-widest italic">Héritage & Savoir-faire</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-bold tracking-widest uppercase opacity-70">Notre Sodabi est distillé selon des méthodes ancestrales transmises de génération en génération.</p>
            </div>
            <div className="space-y-6">
              <div className="w-20 h-20 bg-primary-500/10 rounded-full border border-primary-500/20 flex items-center justify-center mx-auto text-primary-500">
                <Leaf className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold font-serif uppercase tracking-widest italic">Ingrédients du Terroir</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-bold tracking-widest uppercase opacity-70">Ananas d'Afrique, racines médicinales et gingembre bio pour une expérience sensorielle intacte.</p>
            </div>
            <div className="space-y-6">
              <div className="w-20 h-20 bg-primary-500/10 rounded-full border border-primary-500/20 flex items-center justify-center mx-auto text-primary-500">
                <Beer className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold font-serif uppercase tracking-widest italic">Liqueur de Légende</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-bold tracking-widest uppercase opacity-70">Une bouteille de Mystik n'est pas qu'une boisson, c'est un voyage au cœur de l'Afrique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue Section */}
      <section id="catalogue" className="py-32 bg-[#fafaf9]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="animate-slide-up">
              <Badge variant="primary" className="bg-secondary text-white">Nos Terres, Nos Saveurs</Badge>
              <h2 className="text-5xl md:text-7xl font-display font-bold mt-6 tracking-tighter uppercase italic leading-none">
                La Collection <span className="text-primary-500 underline decoration-black/5 decoration-8 underline-offset-8">MYSTIK</span>
              </h2>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 space-x-3 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    px-8 py-3 rounded-none text-xs font-bold tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 border
                    ${activeCategory === cat 
                      ? 'bg-secondary text-white border-secondary shadow-xl scale-105' 
                      : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 h-[500px] rounded-none" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredProducts.map((p, idx) => (
                <Card key={p.id} className="group flex flex-col h-full animate-fade-in border-none shadow-none bg-transparent" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <Link to={`/product/${p.id}`} className="block relative overflow-hidden aspect-[3/4] bg-white shadow-2xl">
                    <img 
                      src={p.image} 
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6">
                      <Badge variant="primary" className="bg-secondary text-white shadow-lg tracking-widest">{p.category}</Badge>
                    </div>
                    {p.vol && (
                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/90 backdrop-blur-md p-4">
                        <span className="text-[10px] font-bold tracking-widest text-secondary">{p.vol}</span>
                        <span className="text-[10px] font-bold tracking-widest text-primary-600">{p.size}</span>
                      </div>
                    )}
                  </Link>

                  <div className="py-8 flex flex-col flex-grow bg-transparent">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h3 className="text-2xl font-serif font-bold tracking-tight text-secondary leading-none uppercase">
                        <Link to={`/product/${p.id}`} className="hover:text-primary-600 transition-colors italic">{p.name}</Link>
                      </h3>
                    </div>
                    <div className="text-lg font-bold text-primary-600 mb-6 italic underline decoration-secondary/10 decoration-2 underline-offset-4">{formatPrice(p.price)}</div>
                    
                    <p className="text-xs text-gray-500 font-bold tracking-widest mb-10 opacity-70 flex-grow uppercase line-clamp-2">
                      {p.description}
                    </p>

                    <Button 
                      className="w-full btn-primary" 
                      onClick={(e) => {
                        e.preventDefault();
                        addItem(p);
                      }}
                    >
                      AJOUTER À LA COLLECTION
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cultural Section */}
      <section className="py-32 bg-secondary text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
          <img src="/images/mystik/logo mystik black.png" alt="Logo Watermark" className="w-[500px] absolute -top-40 -left-40 rotate-12" />
          <img src="/images/mystik/logo mystik black.png" alt="Logo Watermark" className="w-[400px] absolute -bottom-40 -right-40 -rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <span className="text-xs font-bold tracking-[0.5em] text-primary-500 uppercase mb-6 block">Made in Togo</span>
          <h2 className="text-5xl md:text-8xl font-display font-bold mb-10 tracking-tighter uppercase italic leading-none">
            L'Esprit des <br /> Légendes.
          </h2>
          <p className="max-w-xl mx-auto text-sm font-bold tracking-widest text-gray-400 uppercase leading-relaxed mb-12 italic opacity-80">
            Mystik n'est pas une liqueur comme les autres. C'est l'âme de nos terres togolaises, une célébration de notre patrimoine et de notre hospitalité.
          </p>
          <div className="flex justify-center">
             <Button 
               className="btn-primary bg-primary-500 text-secondary border-none hover:bg-white hover:text-black"
               onClick={() => navigate('/about')}
             >
               DÉCOUVRIR NOTRE HISTOIRE
             </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
