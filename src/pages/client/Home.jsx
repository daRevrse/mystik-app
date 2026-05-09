import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useCartStore } from '../../store/useCartStore';
import { ArrowRight, Star, Leaf, Ghost, Beer, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['Tous']);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(0);
  const reviewIntervalRef = useRef(null);
  const { addItem } = useCartStore();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData, reviewsData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getReviews().catch(() => [])
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(['Tous', ...categoriesData.map(c => c.name)]);
        // Filter active reviews client-side to avoid Firestore composite index requirement
        setReviews(reviewsData.filter(r => r.isActive !== false));
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const activeProducts = products.filter(p => p.isActive !== false);
    if (activeCategory === 'Tous') {
      setFilteredProducts(activeProducts);
    } else {
      setFilteredProducts(activeProducts.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, products]);

  // Auto-rotate reviews
  useEffect(() => {
    if (reviews.length > 1) {
      reviewIntervalRef.current = setInterval(() => {
        setCurrentReview(prev => (prev + 1) % reviews.length);
      }, 6000);
      return () => clearInterval(reviewIntervalRef.current);
    }
  }, [reviews.length]);

  const nextReview = () => {
    clearInterval(reviewIntervalRef.current);
    setCurrentReview(prev => (prev + 1) % reviews.length);
  };
  const prevReview = () => {
    clearInterval(reviewIntervalRef.current);
    setCurrentReview(prev => (prev - 1 + reviews.length) % reviews.length);
  };

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
          <Badge variant="primary" className="mb-4 md:mb-6 px-4 py-1 border border-primary-500/30 bg-primary-500/10 text-primary-400 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs">
            L'Esprit Authentique de Nos Terres
          </Badge>
          <h1 className="text-5xl md:text-9xl font-display font-bold text-white mb-4 md:mb-8 tracking-tighter leading-[0.85] uppercase italic">
            MYSTIK<br />
            <span className="text-2xl md:text-7xl text-primary-500 underline decoration-white/20 decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">LEGEND'S DRINK.</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 font-bold italic opacity-90 tracking-wide uppercase px-4 md:px-0">
            Découvrez l'excellence du Sodabi Togolais. Une liqueur premium distillée avec passion et tradition.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-6 md:px-0">
            <Button size="lg" className="w-full md:w-auto px-8 md:px-12 py-4 md:py-6 bg-primary-500 text-secondary" onClick={() => document.getElementById('catalogue').scrollIntoView({ behavior: 'smooth' })}>
              ACHETER MAINTENANT
            </Button>
            <Button 
               variant="outline" 
               size="lg" 
               className="w-full md:w-auto border-white text-white hover:bg-white hover:text-secondary group px-8 md:px-12 py-4 md:py-6"
               onClick={() => navigate('/about')}
            >
              NOTRE HISTOIRE
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/30 animate-pulse">
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
                      AJOUTER AU PANIER
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews / Testimonials Section */}
      {reviews.length > 0 && (
        <section className="py-24 md:py-32 bg-[#fafaf9] relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-amber-200/30 rounded-full blur-xl" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 md:mb-20">
              <Badge variant="primary" className="bg-secondary text-white mb-6">Témoignages</Badge>
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase italic leading-none text-secondary">
                Ce que disent nos <br />
                <span className="text-primary-500 underline decoration-black/5 decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">Ambassadeurs.</span>
              </h2>
            </div>

            {/* Carousel */}
            <div className="max-w-5xl mx-auto relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentReview * 100}%)` }}
                >
                  {reviews.map((review, idx) => (
                    <div key={review.id || idx} className="w-full flex-shrink-0 px-4">
                      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 bg-white p-8 md:p-12 shadow-xl">
                        
                        {/* Photo Side */}
                        <div className="relative flex-shrink-0">
                          {/* Decorative Elements - Harmonized Mystik Palette */}
                          <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary-500/10 rounded-full blur-xl z-0" />
                          <div className="absolute -top-3 left-4 w-10 h-10 bg-primary-500/20 rounded-full z-0" />
                          <div className="absolute top-12 -right-4 w-6 h-6 bg-primary-400/30 rounded-full z-0" />
                          <div className="absolute -bottom-4 left-8 w-12 h-12 bg-secondary/5 rounded-full z-0 border border-primary-500/10" />
                          <div className="absolute bottom-8 -right-6 w-14 h-14 bg-primary-500/5 rounded-full blur-md z-0" />
                          <div className="absolute top-1/2 -left-2 w-4 h-4 bg-primary-500/40 rounded-full z-0" />
                          
                          {review.photo ? (
                            <div className="relative w-48 h-48 md:w-64 md:h-72 overflow-hidden rounded-2xl z-10 shadow-lg">
                              <img 
                                src={review.photo} 
                                alt={review.customerName} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="relative w-48 h-48 md:w-64 md:h-72 bg-gradient-to-br from-primary-500/20 to-primary-500/5 rounded-2xl z-10 flex items-center justify-center shadow-lg border border-primary-500/10">
                              <img 
                                src="/images/mystik/logo mystik.png" 
                                alt="Mystik Logo" 
                                className="w-24 md:w-32 opacity-20 grayscale"
                              />
                            </div>
                          )}
                        </div>

                        {/* Text Side */}
                        <div className="flex-1 text-center md:text-left">
                          {/* Quote Icon */}
                          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg shadow-primary-500/30">
                            <Quote className="w-6 h-6 text-secondary" />
                          </div>

                          {/* Message */}
                          <p className="text-base md:text-xl text-gray-700 leading-relaxed mb-8 font-medium italic">
                            "{review.message}"
                          </p>

                          {/* Stars */}
                          <div className="flex gap-1 mb-4 justify-center md:justify-start">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star 
                                key={s} 
                                className={`w-4 h-4 ${
                                  s <= (review.rating || 5) 
                                    ? 'text-amber-400 fill-amber-400' 
                                    : 'text-gray-200 fill-gray-200'
                                }`} 
                              />
                            ))}
                          </div>

                          {/* Author */}
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-lg font-bold text-secondary uppercase tracking-wide">{review.customerName}</p>
                            <p className="text-[11px] font-bold text-primary-500 uppercase tracking-[0.3em] mt-1">Ambassadeur Mystik</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {reviews.length > 1 && (
                <>
                  <button 
                    onClick={prevReview}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-8 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-secondary hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all shadow-lg z-20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextReview}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-8 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-secondary hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all shadow-lg z-20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Dots */}
              {reviews.length > 1 && (
                <div className="flex justify-center gap-3 mt-10">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        clearInterval(reviewIntervalRef.current);
                        setCurrentReview(idx);
                      }}
                      className={`rounded-full transition-all duration-500 ${
                        idx === currentReview 
                          ? 'w-10 h-3 bg-primary-500' 
                          : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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
