import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useCartStore } from '../../store/useCartStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, Minus, Plus, ShoppingBag, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.getProductById(id);
        if (data.isActive === false) {
           navigate('/');
           return;
        }
        setProduct(data);
      } catch (error) {
        console.error("Produit non trouvé", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="pt-32 pb-24 bg-[#fafaf9]">
      <div className="container mx-auto px-4">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 hover:text-secondary mb-12 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Product Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-white shadow-2xl">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-8 left-8">
              <Badge variant="primary" className="bg-secondary text-white text-xs px-4 py-1.5 shadow-sm font-bold tracking-widest uppercase italic">
                {product.category}
              </Badge>
            </div>
            {product.vol && (
              <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md px-6 py-3 font-display font-bold italic text-secondary border border-gray-100">
                {product.vol} — {product.size}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-10">
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary-600 uppercase mb-4 block underline decoration-primary-500 decoration-2 underline-offset-4">{product.details?.subtitle || "Produit du Togo 🇹🇬"}</span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-secondary mb-8 leading-[0.9] uppercase italic">
                {product.name}
              </h1>
              <div className="flex items-center gap-6 mb-10">
                <span className="text-4xl font-bold text-secondary italic underline decoration-primary-500/20 decoration-4 underline-offset-8">{formatPrice(product.price)}</span>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed font-bold tracking-widest uppercase italic opacity-70">
                {product.description}
              </p>
            </div>

            {/* Detailed Info */}
            {product.details ? (
              <div className="mb-12 space-y-10 animate-fade-in">

                {/* Tasting Notes */}
                <div>
                   <h4 className="text-sm font-bold text-secondary tracking-widest uppercase mb-6 border-b border-gray-200 pb-2">
                     NOTES DE DÉGUSTATION
                   </h4>
                   <div className="space-y-4">
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest"><span className="text-secondary/80 mr-2">• Attaque :</span><span className="text-gray-400 italic font-medium">{product.details.taste.attaque}</span></p>
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest"><span className="text-secondary/80 mr-2">• Cœur :</span><span className="text-gray-400 italic font-medium">{product.details.taste.coeur}</span></p>
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest"><span className="text-secondary/80 mr-2">• Finale :</span><span className="text-gray-400 italic font-medium">{product.details.taste.finale}</span></p>
                   </div>
                </div>

                {/* Caractère */}
                {product.details.caractere && product.details.caractere.length > 0 && (
                   <div>
                     <h4 className="text-sm font-bold text-secondary tracking-widest uppercase mb-4 border-b border-gray-200 pb-2">
                       CARACTÈRE
                     </h4>
                     <div className="flex flex-wrap gap-3">
                       {product.details.caractere.map((item, idx) => (
                         <span key={idx} className="bg-primary-500/10 text-secondary border border-primary-500/20 text-[10px] px-4 py-1.5 font-bold tracking-widest uppercase">
                           {item}
                         </span>
                       ))}
                     </div>
                   </div>
                )}

                {/* Conseils */}
                <div>
                   <h4 className="text-sm font-bold text-secondary tracking-widest uppercase mb-4 border-b border-gray-200 pb-2">
                     CONSEILS DE DÉGUSTATION
                   </h4>
                   <ul className="space-y-3">
                     {product.details.conseils.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-500 font-bold tracking-widest uppercase flex items-center gap-3">
                          <span className="w-1 h-1 bg-primary-500 rounded-full inline-block" />
                          {item}
                        </li>
                     ))}
                   </ul>
                </div>

                {/* Made in Togo Block */}
                <div className="p-8 bg-white border border-gray-100 text-center space-y-4 shadow-sm">
                  <span className="text-xs font-bold text-secondary uppercase tracking-[0.3em] block underline decoration-primary-500 decoration-2 underline-offset-4">MADE IN TOGO 🇹🇬</span>
                  <p className="text-[11px] text-gray-500 font-bold tracking-widest uppercase leading-loose">{product.details.madeIn}</p>
                </div>
              </div>
            ) : (
              <div className="mb-12 p-8 bg-white/50 border border-gray-100 italic space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase">
                    <Star className="w-4 h-4 text-primary-500" />
                    <span>Sodabi Artisanal distillé au feu de bois</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase">
                    <Star className="w-4 h-4 text-primary-500" />
                    <span>Macération longue en fûts de chêne (Roots)</span>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-12">
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4 block">Quantité souhaitée</span>
              <div className="flex items-center space-x-8">
                <div className="flex items-center border border-gray-200 p-1 bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-all text-secondary"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-bold text-xl text-secondary">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-all text-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-4">
                  Disponibilité : <br />
                  <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'} font-bold`}>
                    {product.stock > 0 ? 'Disponible' : 'Épuisé'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
              <Button 
                size="lg" 
                className="flex-grow py-6 text-lg font-display tracking-widest italic disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => addItem(product, quantity)}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? `AJOUTER À MA COLLECTION — ${formatPrice(product.price * quantity)}` : 'PRODUIT ÉPUISÉ'}
              </Button>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-secondary opacity-60">
                <Truck className="w-5 h-5 text-primary-500" />
                <span className="text-[8px] font-bold tracking-widest uppercase">Livraison Togo & Int.</span>
              </div>
              <div className="flex items-center space-x-3 text-secondary opacity-60">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                <span className="text-[8px] font-bold tracking-widest uppercase">Certifié Qualité</span>
              </div>
              <div className="flex items-center space-x-3 text-secondary opacity-60">
                <RefreshCw className="w-5 h-5 text-primary-500" />
                <span className="text-[8px] font-bold tracking-widest uppercase">Service Client 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
