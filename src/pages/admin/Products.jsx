import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAdminStore } from '../../store/useAdminStore';
import { Edit3, Plus, Search, Package, TrendingUp, MoreHorizontal, Save, X, Star } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ price: 0, stock: 0 });
  const { updateProduct: storeUpdate } = useAdminStore();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA';
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setEditValues({ price: p.price, stock: p.stock });
  };

  const handleSave = async (p) => {
    const updated = { ...p, ...editValues };
    await api.updateProduct(updated);
    setProducts(products.map(item => item.id === p.id ? updated : item));
    setEditingId(null);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <h1 className="text-3xl font-display font-bold text-secondary tracking-tighter uppercase italic leading-none underline decoration-amber-500 decoration-8 underline-offset-8">
               Trésors du <span className="text-amber-500">CATALOGUE</span>
             </h1>
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-[0.4em] italic opacity-70">Gestion des collections Mystik</p>
        </div>
        
        <Button size="lg" className="btn-primary bg-amber-500 text-secondary border-none px-10 shadow-2xl shadow-amber-500/20">
          <Plus className="w-5 h-5 mr-3" />
          INSCRIRE UN NOUVEAU TRÉSOR
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-none animate-pulse" />)
        ) : (
          products.map((p, idx) => (
            <Card key={p.id} className="p-8 border-none shadow-sm bg-white group flex flex-col md:flex-row items-center gap-10 animate-fade-in rounded-none" style={{ animationDelay: `${idx * 0.05}s` }}>
              {/* Product Thumbnail */}
              <div className="w-28 h-28 overflow-hidden bg-[#fafaf9] shrink-0 border border-gray-100 group-hover:shadow-2xl transition-all duration-500">
                <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt={p.name} />
              </div>

              {/* Product Info */}
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                  <h3 className="text-lg font-serif font-bold text-secondary uppercase italic tracking-tight underline decoration-amber-500/20 decoration-2 underline-offset-4">{p.name}</h3>
                  <Badge variant="primary" className="scale-75 origin-left bg-secondary text-white border-none italic">{p.category}</Badge>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] line-clamp-1 italic max-w-sm opacity-60">{p.description}</p>
              </div>

              {/* Editing Controls */}
              <div className="flex items-center gap-16 shrink-0">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-3">Valeur Collection</p>
                  {editingId === p.id ? (
                    <div className="flex items-center border-b-2 border-amber-500 bg-amber-50/50">
                      <input 
                        type="number" 
                        value={editValues.price} 
                        onChange={(e) => setEditValues({ ...editValues, price: parseInt(e.target.value) })}
                        className="w-24 bg-transparent text-sm font-bold text-secondary px-3 py-2 focus:outline-none"
                      />
                      <span className="text-[8px] font-bold text-amber-600 pr-3">FCFA</span>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-secondary italic underline decoration-gray-900/10 decoration-2 underline-offset-8">{formatPrice(p.price)}</p>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-3">Unités en Réserve</p>
                  {editingId === p.id ? (
                    <div className="flex items-center border-b-2 border-amber-500 bg-amber-50/50">
                      <input 
                        type="number" 
                        value={editValues.stock} 
                        onChange={(e) => setEditValues({ ...editValues, stock: parseInt(e.target.value) })}
                        className="w-20 bg-transparent text-sm font-bold text-secondary px-3 py-2 focus:outline-none"
                      />
                      <Package className="w-3.5 h-3.5 text-amber-600 mr-3" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <p className={`text-sm font-bold italic underline underline-offset-8 decoration-2 ${p.stock < 10 ? 'text-red-500 decoration-red-500/40' : 'text-amber-600 decoration-amber-500/30'}`}>
                        {p.stock} Bouteilles
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {editingId === p.id ? (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handleSave(p)} className="bg-emerald-600 px-4 hover:bg-emerald-700 py-4 h-auto border-none">
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)} className="px-4 py-4 h-auto border-gray-100 italic">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(p)} className="group border-gray-100 px-4 py-4 h-auto hover:bg-secondary hover:text-white transition-all duration-500 shadow-sm">
                        <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      </Button>
                      <Button variant="ghost" size="sm" className="px-3 text-gray-300 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="p-12 bg-secondary text-white border-none shadow-2xl relative overflow-hidden group rounded-none">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none italic flex items-center justify-center text-[20rem] font-display font-bold select-none leading-none">
          MYSTIK
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
          <Badge className="bg-amber-500 text-secondary border-none scale-125 font-bold tracking-[0.4em] px-6">LES INSIGHTS DE L'ESPRIT</Badge>
          <h2 className="text-4xl font-display font-bold uppercase italic tracking-tighter leading-[0.9]">
            Vos réserves sont à <span className="text-amber-500 underline decoration-white/20 decoration-8 underline-offset-8">84% de leur capacité sacrée.</span>
          </h2>
          <p className="text-[10px] text-gray-400 font-bold tracking-[0.4em] uppercase italic leading-relaxed opacity-60">
            LA LIQUEUR "RACINES TRADITION" EST PRÈS DE L'ÉPUISEMENT. PRÉVOIR UNE NOUVELLE MACÉRATION DANS LES 48H POUR HONORER LES FUTURES LÉGENDES.
          </p>
          <div className="pt-4">
             <Button className="btn-primary bg-white text-secondary hover:bg-amber-500 hover:text-white border-none italic text-xs px-12">LANCER UN RÉAPPROVISIONNEMENT</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminProducts;
