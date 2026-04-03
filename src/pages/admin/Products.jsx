import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAdminStore } from '../../store/useAdminStore';
import { 
  Edit3, Plus, Search, Package, TrendingUp, 
  MoreHorizontal, Save, X, Eye, EyeOff, 
  MinusCircle, PlusCircle, ShoppingBag, 
  AlertCircle, CheckCircle2, Upload, Loader2, Image as ImageIcon
} from 'lucide-react';

const AdminProducts = () => {
  const { products, fetchProducts, addProduct, updateProduct, replenishStock, isLoading: storeLoading } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ price: 0, stock: 0 });
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [replenishQuantities, setReplenishQuantities] = useState({}); // { productId: quantity }

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Fruitée',
    stock: '',
    vol: '20% Vol',
    size: '75cl',
    image: '' 
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    load();
  }, [fetchProducts]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA';
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setEditValues({ price: p.price, stock: p.stock });
  };

  const handleSave = async (p) => {
    const updated = { ...p, ...editValues };
    await updateProduct(updated);
    setEditingId(null);
  };

  const handleToggleStatus = async (p) => {
    const updated = { ...p, isActive: p.isActive === false ? true : false };
    await updateProduct(updated);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
        alert("Veuillez sélectionner une image pour ce trésor.");
        return;
    }

    try {
        setUploading(true);
        // 1. Upload de l'image vers Cloud Storage
        const imageUrl = await api.uploadProductImage(selectedFile);
        
        // 2. Création du produit avec l'URL Firebase
        const data = {
          ...newProduct,
          image: imageUrl,
          price: parseInt(newProduct.price),
          stock: parseInt(newProduct.stock),
        };
        
        await addProduct(data);
        
        // Reset
        setShowAddModal(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: 'Fruitée',
          stock: '',
          vol: '20% Vol',
          size: '75cl',
          image: ''
        });
        setSelectedFile(null);
        setImagePreview(null);
    } catch (error) {
        console.error("Erreur d'ajout:", error);
        alert("Une erreur est survenue lors de l'ajout.");
    } finally {
        setUploading(false);
    }
  };

  const handleReplenishSubmit = async () => {
    for (const [id, qty] of Object.entries(replenishQuantities)) {
      if (qty !== 0) {
        await replenishStock(id, qty);
      }
    }
    setShowReplenishModal(false);
    setReplenishQuantities({});
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <h1 className="text-2xl md:text-3xl font-display font-bold text-secondary tracking-tighter uppercase italic leading-none underline decoration-amber-500 decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">
               Trésors du <span className="text-amber-500">CATALOGUE</span>
             </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] italic opacity-70">
              {products.length} Produits enregistrés dans la réserve
            </p>
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={() => setShowAddModal(true)}
          className="btn-primary bg-amber-500 text-secondary border-none px-10 shadow-2xl shadow-amber-500/20 hover:bg-secondary hover:text-white transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-3" />
          INSCRIRE UN NOUVEAU TRÉSOR
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-none animate-pulse" />)
        ) : (
          products.map((p, idx) => (
            <Card key={p.id} className={`p-8 border-none shadow-sm bg-white group flex flex-col md:flex-row items-center gap-10 animate-fade-in rounded-none transition-all duration-500 ${p.isActive === false ? 'opacity-60 bg-gray-50' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
              {/* Product Thumbnail */}
              <div className="w-28 h-28 overflow-hidden bg-[#fafaf9] shrink-0 border border-gray-100 group-hover:shadow-2xl transition-all duration-500 relative">
                <img src={p.image} className={`w-full h-full object-cover transition-all duration-700 ${p.isActive === false ? 'grayscale' : 'grayscale group-hover:grayscale-0'}`} alt={p.name} />
                {p.isActive === false && (
                    <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center">
                        <EyeOff className="text-white w-8 h-8" />
                    </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-grow text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                  <h3 className={`text-lg font-serif font-bold text-secondary uppercase italic tracking-tight underline decoration-2 underline-offset-4 ${p.isActive === false ? 'decoration-gray-300' : 'decoration-amber-500/20'}`}>{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="scale-75 origin-left bg-secondary text-white border-none italic">{p.category}</Badge>
                    {p.isActive === false && <Badge className="bg-gray-200 text-gray-500 border-none scale-75 italic origin-left font-bold uppercase tracking-widest">Masqué</Badge>}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] line-clamp-1 italic max-w-sm opacity-60">{p.description}</p>
              </div>

              {/* Editing Controls */}
              <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-8 md:gap-16 shrink-0">
                <div className="text-center min-w-[100px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-3 leading-none">Valeur</p>
                  {editingId === p.id ? (
                    <div className="flex items-center border-b-2 border-amber-500 bg-amber-50/50">
                      <input 
                        type="number" 
                        value={editValues.price} 
                        onChange={(e) => setEditValues({ ...editValues, price: parseInt(e.target.value) })}
                        className="w-24 bg-transparent text-sm font-bold text-secondary px-3 py-2 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-secondary italic underline decoration-gray-900/10 decoration-2 underline-offset-8">{formatPrice(p.price)}</p>
                  )}
                </div>

                <div className="text-center min-w-[100px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-3 leading-none">Réserve</p>
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
                        {p.stock} Ut.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Buttons */}
                <div className="flex gap-2">
                  {editingId === p.id ? (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handleSave(p)} className="bg-emerald-600 px-4 hover:bg-emerald-700 py-3 h-auto border-none">
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)} className="px-4 py-3 h-auto border-gray-100 italic">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(p)} 
                        className="group border-gray-100 px-4 py-3 h-auto hover:bg-secondary hover:text-white transition-all duration-300 shadow-sm"
                      >
                        <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleStatus(p)} 
                        className={`group px-4 py-3 h-auto transition-all duration-300 shadow-sm border-gray-100 ${p.isActive === false ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'hover:bg-amber-500 hover:text-white'}`}
                        title={p.isActive === false ? "Activer le produit" : "Masquer le produit"}
                      >
                        {p.isActive === false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Replenishment Alert Footer (Corrected Style) */}
      <Card className="p-12 bg-secondary text-white border-none shadow-2xl relative overflow-hidden group rounded-none">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none italic flex items-center justify-center text-[20rem] font-display font-bold select-none leading-none">
          MYSTIK
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
          <div className="flex justify-center">
            <Badge className="bg-amber-500 text-secondary border-none scale-125 font-bold tracking-[0.4em] px-6">LES INSIGHTS DE L'ESPRIT</Badge>
          </div>
          <h2 className="text-4xl font-display font-bold uppercase italic tracking-tighter leading-[1.1]">
            État Global des <span className="text-amber-500 underline decoration-white/20 decoration-8 underline-offset-8">RÉSERVES MYSTIK.</span>
          </h2>
          <p className="text-[10px] text-gray-400 font-bold tracking-[0.4em] uppercase italic leading-relaxed opacity-60">
            LA TRADITION DEMANDE UNE ATTENTION CONSTANTE. ASSUREZ-VOUS QUE CHAQUE TRÉSOR EST DISPONIBLE POUR LES AMATEURS DE LÉGENDES.
          </p>
          <div className="pt-4">
             <Button 
                onClick={() => setShowReplenishModal(true)}
                className="btn-primary bg-amber-500 text-secondary hover:bg-white hover:text-secondary border-none italic text-xs px-12 py-5 font-bold tracking-widest shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
            >
                LANCER UN RÉAPPROVISIONNEMENT
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL: ADD PRODUCT */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-secondary/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-none md:zoom-in-95 duration-300 flex flex-col rounded-t-3xl md:rounded-none">
            <div className="bg-secondary p-6 md:p-8 text-white flex justify-between items-center shrink-0">
                <h2 className="text-xl md:text-3xl font-display font-bold italic uppercase tracking-tight">Nouvelle <span className="text-amber-500">LÉGENDE</span></h2>
                <button onClick={() => setShowAddModal(false)} className="hover:text-amber-500 transition-colors p-2 -mr-2">
                    <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Image Upload Area */}
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic mb-3 block">PORTRAIT DU TRÉSOR (IMAGE)</label>
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="w-full h-40 md:h-48 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition-all group bg-gray-50 relative overflow-hidden"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full object-contain" alt="Preview" />
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-amber-500 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliquer pour télécharger le visuel</p>
                                </>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Désignation</label>
                        <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border-b-2 border-gray-100 py-2 md:py-3 text-sm font-bold uppercase focus:outline-none focus:border-amber-500 transition-colors bg-transparent" placeholder="Ex: Mystik Gingembre" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Catégorie</label>
                        <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border-b-2 border-gray-100 py-2 md:py-3 text-sm font-bold uppercase focus:outline-none focus:border-amber-500 transition-colors bg-transparent">
                            <option value="Fruitée">Fruitée</option>
                            <option value="Spéciale">Spéciale</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Description de l'Esprit</label>
                    <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border-b-2 border-gray-100 py-2 md:py-3 text-sm font-bold italic focus:outline-none focus:border-amber-500 transition-colors h-20 md:h-24 resize-none bg-transparent" placeholder="Décrivez l'âme de cette liqueur..." />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic text-left block">Prix (FCFA)</label>
                        <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border-b-2 border-gray-100 py-2 md:py-3 text-sm font-bold text-left md:text-center focus:outline-none focus:border-amber-500 transition-colors bg-transparent" placeholder="12000" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic text-left block">Stock</label>
                        <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full border-b-2 border-gray-100 py-2 md:py-3 text-sm font-bold text-left md:text-center focus:outline-none focus:border-amber-500 transition-colors bg-transparent" placeholder="24" />
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic text-left md:text-center block">Volume / Taille</label>
                        <input value={newProduct.vol} onChange={e => setNewProduct({...newProduct, vol: e.target.value})} className="w-full border-b-2 border-gray-100 py-2 md:py-3 text-sm font-bold text-left md:text-center focus:outline-none focus:border-amber-500 transition-colors bg-transparent" placeholder="20% Vol / 75cl" />
                    </div>
                </div>
              </form>

              <div className="p-6 md:p-8 bg-gray-50 flex gap-4 shrink-0 pb-24 md:pb-8">
                <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1 italic py-4 md:py-3 border-gray-200" disabled={uploading}>ANNULER</Button>
                <Button 
                    onClick={handleAddProduct} 
                    className="flex-1 bg-secondary text-white hover:bg-amber-500 border-none italic shadow-xl flex items-center justify-center gap-2 py-4 md:py-3"
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            CRÉATION...
                        </>
                    ) : (
                        "ENREGISTRER"
                    )}
                </Button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: REPLENISHMENT */}
      {showReplenishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-amber-500 p-6 md:p-8 flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary text-white flex items-center justify-center rounded-none shadow-lg">
                  <TrendingUp className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h2 className="text-xl md:text-3xl font-display font-bold italic uppercase tracking-tight text-secondary">Réapprovisionnement <span className="text-white">MYSTIK</span></h2>
              </div>
              <button onClick={() => setShowReplenishModal(false)} className="text-secondary hover:text-white transition-colors">
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6 border-b pb-4 border-gray-100 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Saisissez la quantité à AJOUTER (+) ou à RETIRER (-) de vos réserves.
              </p>
              
              <div className="space-y-4">
                {products.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 bg-gray-50 border border-gray-100 hover:border-amber-200 transition-colors group">
                    <div className="flex items-center gap-4 flex-grow">
                        <div className="w-14 h-14 shrink-0 bg-white border border-gray-200 overflow-hidden">
                            <img src={p.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="text-xs font-bold uppercase italic tracking-tighter text-secondary">{p.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Actuel:</span>
                                <span className="text-[10px] font-bold text-amber-600 underline underline-offset-2">{p.stock} Ut.</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-4">
                        <div className="flex items-center gap-4 bg-white border border-gray-200 px-4 py-2 group-hover:border-amber-500 transition-colors">
                            <button 
                                onClick={() => setReplenishQuantities(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) - 1 }))}
                                className="text-red-500 hover:scale-110 transition-transform"
                            >
                                <MinusCircle className="w-5 h-5" />
                            </button>
                            
                            <div className="w-16 text-center">
                                <input 
                                type="number"
                                placeholder="0"
                                value={replenishQuantities[p.id] || ''}
                                onChange={(e) => setReplenishQuantities(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                                className="w-full text-sm font-bold text-center focus:outline-none"
                                />
                            </div>

                            <button 
                                onClick={() => setReplenishQuantities(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }))}
                                className="text-emerald-500 hover:scale-110 transition-transform"
                            >
                                <PlusCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="min-w-[80px] text-right">
                        <p className={`text-xs font-bold italic ${ (replenishQuantities[p.id] || 0) > 0 ? 'text-emerald-600' : (replenishQuantities[p.id] || 0) < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                            { (replenishQuantities[p.id] || 0) > 0 ? `+${replenishQuantities[p.id]}` : (replenishQuantities[p.id] || 0) }
                        </p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Nouvel État: { (p.stock || 0) + (replenishQuantities[p.id] || 0) }</p>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-secondary flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 text-white/50 italic text-[10px] font-bold uppercase tracking-widest">
                 <CheckCircle2 className="w-4 h-4 text-amber-500" />
                 Validation des réserves requise
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Button onClick={() => setShowReplenishModal(false)} variant="outline" className="flex-1 md:flex-none border-white/20 text-white hover:bg-white/10 italic">ANNULER</Button>
                <Button onClick={handleReplenishSubmit} className="flex-1 md:flex-none bg-amber-500 text-secondary hover:bg-white border-none italic font-bold px-10">CONFIRMER</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
