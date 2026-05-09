import React, { useEffect, useMemo, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Users, Search, MessageCircle, ShoppingBag, TrendingUp, Calendar, ArrowRight, Download, Share2, Copy, CheckCircle2, X, Star, ImagePlus, Trash2, Eye, EyeOff, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Clients = () => {
  const { orders, fetchOrders, isLoading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' | 'reviews'

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    message: '',
    rating: 5,
    photo: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchOrders();
    loadReviews();
  }, [fetchOrders]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await api.getReviews();
      setReviews(data);
    } catch (err) {
      console.error("Erreur chargement avis:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const clientsData = useMemo(() => {
    const clientsMap = new Map();

    orders.forEach(order => {
      const email = order.customer?.email?.toLowerCase() || 'inconnu';
      const phone = order.customer?.phone || 'inconnu';
      const key = email !== 'inconnu' ? email : phone;

      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          id: key,
          firstName: order.customer?.firstName || '',
          lastName: order.customer?.lastName || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
          city: order.customer?.city || 'Lomé',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: order.date,
          orders: []
        });
      }

      const client = clientsMap.get(key);
      client.ordersCount += 1;
      client.totalSpent += (order.total || 0);
      if (new Date(order.date) > new Date(client.lastOrderDate)) {
        client.lastOrderDate = order.date;
      }
      client.orders.push(order);
    });

    return Array.from(clientsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filteredClients = clientsData.filter(c => 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' FCFA';

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [promoMessage, setPromoMessage] = useState("Bonjour ! Mystik vous propose une offre spéciale : -20% sur tout le catalogue ce weekend ! 🌿 Profitez-en sur notre boutique en ligne.");

  const generateVCF = (client) => {
    const name = `Mystik - Client ${client.lastName} ${client.firstName}`.trim();
    const vcfContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      `TEL;TYPE=CELL:${client.phone}`,
      `EMAIL:${client.email}`,
      'END:VCARD'
    ].join('\n');
    
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Contact exporté !');
  };

  const exportAllVCF = () => {
    const vcfContent = clientsData.map(client => {
      const name = `Mystik - Client ${client.lastName} ${client.firstName}`.trim();
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${name}`,
        `TEL;TYPE=CELL:${client.phone}`,
        `EMAIL:${client.email}`,
        'END:VCARD'
      ].join('\n');
    }).join('\n');

    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mystik_Tous_Les_Clients.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Tous les contacts ont été exportés !');
  };

  const handleWhatsAppRelance = (client) => {
    const message = `Bonjour ${client.firstName}, c'est Mystik ! 🌿 Nous espérons que vous avez apprécié votre dernière commande. Profitez de -10% sur votre prochain pack avec le code MYSTIKVIP. À bientôt !`;
    const url = `https://wa.me/${client.phone.replace(/\s/g, '').replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const copyPromoMessage = () => {
    navigator.clipboard.writeText(promoMessage);
    toast.success('Message copié !');
  };

  // ─── Reviews Functions ─────────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingPhoto(true);
    try {
      const url = await api.uploadProductImage(file);
      setReviewForm(prev => ({ ...prev, photo: url }));
      toast.success('Photo uploadée !');
    } catch (err) {
      toast.error("Erreur upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.customerName || !reviewForm.message) {
      toast.error('Nom et message requis');
      return;
    }

    try {
      await api.createReview(reviewForm);
      toast.success('Avis ajouté avec succès !');
      setReviewForm({ customerName: '', message: '', rating: 5, photo: '' });
      setShowReviewForm(false);
      loadReviews();
    } catch (err) {
      toast.error("Erreur lors de l'ajout de l'avis");
    }
  };

  const toggleReviewActive = async (review) => {
    try {
      await api.updateReview({ ...review, isActive: !review.isActive });
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, isActive: !r.isActive } : r));
      toast.success(review.isActive ? 'Avis masqué' : 'Avis publié');
    } catch (err) {
      toast.error("Erreur mise à jour");
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Avis supprimé');
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 italic-none">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div>
            <h1 className="text-3xl font-display font-black text-secondary tracking-tighter uppercase italic leading-none mb-3">
              Gestion <span className="text-amber-500">CLIENTS</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] italic opacity-70">
              Ambassadeurs de la légende • {clientsData.length} profils identifiés
            </p>
          </div>
          <button 
            onClick={() => setIsAssistantOpen(true)}
            className="bg-amber-500 text-secondary px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
          >
            <MessageCircle className="w-5 h-5" />
            Assistant WhatsApp
          </button>
        </div>

        <div className="w-full lg:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="RECHERCHER UN NOM, MOBILE OU EMAIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 pl-12 pr-4 py-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-amber-500 transition-all shadow-xl shadow-black/5 rounded-none"
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'clients' 
              ? 'border-amber-500 text-secondary' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Clients ({clientsData.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'reviews' 
              ? 'border-amber-500 text-secondary' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Star className="w-4 h-4 inline mr-2" />
          Avis Clients ({reviews.length})
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: CLIENTS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'clients' && (
        <>
          {/* Stats Quick View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 border-none shadow-xl bg-white flex items-center gap-6 rounded-none">
              <div className="w-14 h-14 bg-secondary text-amber-500 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clients Totaux</p>
                <p className="text-2xl font-display font-black text-secondary italic">{clientsData.length}</p>
              </div>
            </Card>
            <Card className="p-8 border-none shadow-xl bg-white flex items-center gap-6 rounded-none">
              <div className="w-14 h-14 bg-amber-500 text-secondary flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenu Moyen / Client</p>
                <p className="text-2xl font-display font-black text-secondary italic">
                  {clientsData.length > 0 ? formatPrice(clientsData.reduce((acc, c) => acc + c.totalSpent, 0) / clientsData.length) : '0 FCFA'}
                </p>
              </div>
            </Card>
            <Card className="p-8 border-none shadow-xl bg-white flex items-center gap-6 rounded-none">
              <div className="w-14 h-14 bg-secondary text-white flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rétention (Répétition)</p>
                <p className="text-2xl font-display font-black text-secondary italic">
                  {clientsData.length > 0 ? ((clientsData.filter(c => c.ordersCount > 1).length / clientsData.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </Card>
          </div>

          {/* Clients Desktop View */}
          <Card className="hidden md:block overflow-hidden border-none shadow-2xl bg-white rounded-none">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-secondary text-white">
                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] italic">Ambassadeur</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] italic">Commandes</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] italic">Dépenses</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] italic">Dernière activité</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] italic">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-secondary font-display font-black text-lg italic group-hover:bg-amber-500 group-hover:text-secondary transition-colors shrink-0">
                            {client.lastName.charAt(0)}{client.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase text-secondary tracking-tight">{client.firstName} {client.lastName}</p>
                            <p className="text-[10px] font-medium text-gray-400 lowercase">{client.email}</p>
                            <p className="text-[10px] font-black text-amber-600 mt-1 uppercase tracking-widest">{client.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="bg-secondary/5 text-secondary text-[10px] font-black px-3 py-1 rounded-none border border-secondary/10">
                          {client.ordersCount} CMD
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-secondary text-sm">
                        {formatPrice(client.totalSpent)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {new Date(client.lastOrderDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                            <button 
                                onClick={() => generateVCF(client)}
                                className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
                                title="Exporter Contact"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleWhatsAppRelance(client)}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 transition-all"
                                title="Relancer sur WhatsApp"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Clients Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="p-6 border-none shadow-xl bg-white rounded-none space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary text-amber-500 flex items-center justify-center font-display font-black text-xl italic shrink-0">
                    {client.lastName.charAt(0)}{client.firstName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-black text-sm uppercase text-secondary tracking-tight">
                        {client.firstName} {client.lastName}
                      </p>
                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 uppercase tracking-widest">
                        {client.ordersCount} CMD
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">{client.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Dépenses</p>
                    <p className="font-black text-secondary text-xs">{formatPrice(client.totalSpent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Dernière activité</p>
                    <p className="font-black text-secondary text-xs">{new Date(client.lastOrderDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => generateVCF(client)}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-secondary py-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Download className="w-4 h-4" />
                    Contact
                  </button>
                  <button 
                    onClick={() => handleWhatsAppRelance(client)}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {filteredClients.length === 0 && !isLoading && (
            <div className="py-20 text-center text-gray-400 uppercase font-black text-xs tracking-widest italic opacity-50">
              Aucun client trouvé pour cette recherche
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB: AVIS CLIENTS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div className="space-y-8">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
                {reviews.filter(r => r.isActive).length} avis publiés sur {reviews.length} total
              </p>
            </div>
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-amber-500 text-secondary px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
            >
              <PlusCircle className="w-5 h-5" />
              Ajouter un Avis
            </button>
          </div>

          {/* Review Form Modal */}
          {showReviewForm && (
            <Card className="p-8 border-2 border-amber-500/30 bg-amber-50/30 shadow-xl space-y-6 animate-fade-in rounded-none">
              <div className="flex justify-between items-center pb-4 border-b border-amber-100">
                <h3 className="text-lg font-display font-black uppercase italic tracking-tight">
                  <Star className="w-5 h-5 inline mr-2 text-amber-500" />
                  Nouvel Avis Client
                </h3>
                <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom du Client *</label>
                    <input
                      type="text"
                      value={reviewForm.customerName}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Koffi Mensah"
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none rounded-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Note</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className={`p-2 transition-all ${star <= reviewForm.rating ? 'text-amber-500 scale-110' : 'text-gray-200 hover:text-amber-300'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Photo (Optionnel)</label>
                    {reviewForm.photo ? (
                      <div className="relative w-24 h-24">
                        <img src={reviewForm.photo} alt="Preview" className="w-full h-full object-cover border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, photo: '' }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-200 cursor-pointer hover:border-amber-400 transition-colors bg-white">
                        <ImagePlus className="w-5 h-5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {uploadingPhoto ? 'Upload...' : 'Choisir une photo'}
                        </span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Témoignage / Message *</label>
                    <textarea
                      value={reviewForm.message}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Mystik est devenue ma boisson préférée. Le goût ananas gingembre est incroyable..."
                      rows={6}
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none rounded-none"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-secondary font-display italic tracking-widest py-4 shadow-xl">
                    PUBLIER L'AVIS
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="py-20 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Chargement des avis...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-20 text-center">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aucun avis client pour le moment</p>
              <p className="text-[9px] text-gray-300 uppercase tracking-widest mt-2">Ajoutez votre premier avis ci-dessus</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className={`p-6 border-none shadow-xl rounded-none overflow-hidden transition-all ${review.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                  {/* Photo Banner */}
                  {review.photo && (
                    <div className="w-full h-32 -mx-6 -mt-6 mb-4" style={{ width: 'calc(100% + 3rem)' }}>
                      <img src={review.photo} alt={review.customerName} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary text-amber-500 flex items-center justify-center font-display font-black text-lg italic shrink-0">
                        {review.customerName?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase text-secondary tracking-tight">{review.customerName}</p>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= (review.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {!review.isActive && (
                      <span className="text-[7px] font-bold text-red-500 bg-red-50 px-2 py-1 uppercase tracking-widest">Masqué</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-6 line-clamp-4">{review.message}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                      {review.createdAt?.toDate 
                        ? review.createdAt.toDate().toLocaleDateString('fr-FR')
                        : review.createdAt?.seconds 
                          ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                          : 'Récent'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleReviewActive(review)}
                        className={`p-1.5 transition-colors ${review.isActive ? 'text-green-500 hover:text-amber-500' : 'text-gray-400 hover:text-green-500'}`}
                        title={review.isActive ? 'Masquer' : 'Publier'}
                      >
                        {review.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Campaign Assistant Modal */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-secondary p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-display font-black uppercase italic tracking-tighter">Assistant <span className="text-amber-500">Campagne</span></h2>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Générez des listes de diffusion instantanément</p>
              </div>
              <button onClick={() => setIsAssistantOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              {/* Step 1: Export */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500 text-secondary flex items-center justify-center font-black text-[10px]">1</div>
                  <h3 className="font-black uppercase text-xs tracking-widest">Exporter les contacts pour WhatsApp</h3>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed italic">
                  Pour créer une <b>Liste de Diffusion</b> sur WhatsApp, vous devez d'abord avoir vos clients dans vos contacts. Ce fichier exporte tous vos clients sous le nom <b>"Mystik - Client [Nom]"</b>.
                </p>
                <button 
                  onClick={exportAllVCF}
                  className="w-full border-2 border-secondary p-4 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                  Télécharger le fichier VCF (Tous les clients)
                </button>
              </div>

              {/* Step 2: Message */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-500 text-secondary flex items-center justify-center font-black text-[10px]">2</div>
                  <h3 className="font-black uppercase text-xs tracking-widest">Préparer votre message promo</h3>
                </div>
                <div className="relative">
                  <textarea 
                    value={promoMessage}
                    onChange={(e) => setPromoMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 border-none p-4 text-[12px] font-medium text-secondary focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button 
                    onClick={copyPromoMessage}
                    className="absolute bottom-4 right-4 bg-secondary text-white p-2 hover:bg-amber-500 transition-colors"
                    title="Copier le message"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step 3: Action */}
              <div className="bg-amber-50 border border-amber-100 p-6 space-y-4">
                <div className="flex items-center gap-3 text-amber-900">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-black uppercase text-[10px] tracking-widest">C'est prêt !</h3>
                </div>
                <ol className="text-[10px] font-bold text-amber-900/70 space-y-2 uppercase tracking-tight list-decimal list-inside">
                  <li>Ouvrez le fichier téléchargé sur votre téléphone</li>
                  <li>Importez les contacts dans votre répertoire</li>
                  <li>Sur WhatsApp : Nouvelle Diffusion → Recherchez "Mystik"</li>
                  <li>Sélectionnez les clients et envoyez votre message copié !</li>
                </ol>
                <button 
                    onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                    className="w-full bg-green-500 text-white py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <Share2 className="w-5 h-5" />
                    Ouvrir WhatsApp Web
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
