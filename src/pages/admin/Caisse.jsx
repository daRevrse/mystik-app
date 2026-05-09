import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard, RefreshCw, CheckCircle2, Phone, Wifi, WifiOff, AlertTriangle, Clock } from 'lucide-react';

const NETWORKS = [
  { id: 'TOGOCEL_TG', label: 'T-Money', icon: '/images/yas.jpg' },
  { id: 'MOOV_TG', label: 'Moov Money', icon: '/images/moov.jpg' },
];

const Caisse = () => {
  const [balances, setBalances] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('loading'); // 'connected' | 'error' | 'loading'
  const [connectionError, setConnectionError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [environment, setEnvironment] = useState(null);
  
  // Transactions history
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  
  // Withdrawal Form State
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('TOGOCEL_TG');

  useEffect(() => {
    fetchBalances();
    fetchTransactions();
  }, []);

  const fetchBalances = async () => {
    setLoading(true);
    setConnectionStatus('loading');
    setConnectionError(null);
    try {
      const res = await fetch('/api/fedapay-balance');
      const data = await res.json();
      if (data.success && data.connected) {
        setBalances(data.balances || []);
        setTotal(data.total || 0);
        setConnectionStatus('connected');
        setLastFetch(data.lastFetch || new Date().toISOString());
        setEnvironment(data.environment);
      } else {
        setConnectionStatus('error');
        setConnectionError(data.error || data.details || 'Erreur inconnue');
        setBalances([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Erreur solde:", err);
      setConnectionStatus('error');
      setConnectionError(err.message || 'Impossible de joindre le serveur API');
      setBalances([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const res = await fetch('/api/fedapay-transactions?limit=15');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Erreur transactions:", err);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    if (!amount || !phone || !network) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          phone,
          network,
          adminId: localStorage.getItem('adminId') || 'admin'
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setAmount('');
        setPhone('');
        setTimeout(() => setSuccess(false), 5000);
        fetchBalances();
        fetchTransactions();
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (err) {
      alert("Erreur lors de la demande de retrait.");
    } finally {
      setWithdrawing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getNetworkName = (mode) => {
    if (!mode) return 'Inconnu';
    const m = mode.toLowerCase();
    if (m.includes('moov') || m.includes('flooz')) return 'Moov / Flooz';
    if (m.includes('mtn') || m.includes('togocel') || m.includes('tmoney')) return 'T-Money / MTN';
    return mode.toUpperCase();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="bg-green-50 text-green-600 text-[8px] font-bold px-2 py-1 uppercase tracking-widest">Approuvé</span>;
      case 'declined':
      case 'canceled':
        return <span className="bg-red-50 text-red-600 text-[8px] font-bold px-2 py-1 uppercase tracking-widest">Refusé</span>;
      case 'pending':
        return <span className="bg-amber-50 text-amber-600 text-[8px] font-bold px-2 py-1 uppercase tracking-widest">En cours</span>;
      default:
        return <span className="bg-gray-50 text-gray-600 text-[8px] font-bold px-2 py-1 uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary uppercase italic leading-none">Gestion <span className="text-primary-500 underline decoration-black/5 decoration-8 underline-offset-8">CAISSE</span></h1>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] opacity-70">Suivi des fonds et retraits FedaPay</p>
            {/* Connection Status Indicator */}
            {connectionStatus === 'connected' && (
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 border border-green-100 animate-fade-in">
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-[8px] font-bold text-green-600 uppercase tracking-widest">
                  Connecté {environment === 'sandbox' ? '(Sandbox)' : '(Live)'}
                </span>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1 border border-red-100 animate-fade-in">
                <WifiOff className="w-3 h-3 text-red-500" />
                <span className="text-[8px] font-bold text-red-600 uppercase tracking-widest">Déconnecté</span>
              </div>
            )}
            {connectionStatus === 'loading' && (
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 border border-gray-100">
                <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Connexion...</span>
              </div>
            )}
          </div>
        </div>
        <Button 
            onClick={() => { fetchBalances(); fetchTransactions(); }} 
            variant="outline" 
            className="border-gray-200 text-gray-500 hover:bg-gray-50 group font-bold tracking-widest text-[10px]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          ACTUALISER LE SOLDE
        </Button>
      </div>

      {/* Error Banner */}
      {connectionStatus === 'error' && connectionError && (
        <div className="bg-red-50 border border-red-100 p-6 flex items-start gap-4 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Erreur de connexion FedaPay</p>
            <p className="text-[10px] font-medium text-red-500 leading-relaxed">{connectionError}</p>
            <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mt-2">
              Vérifiez que FEDAPAY_SECRET_KEY et FEDAPAY_ENVIRONMENT sont correctement configurés dans vos variables d'environnement Vercel.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-10 border-none shadow-2xl relative overflow-hidden bg-secondary text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 -rotate-45 translate-x-32 -translate-y-32 pointer-events-none rounded-full" />
            
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-white/10 flex items-center justify-center rounded-none backdrop-blur-md">
                <Wallet className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Solde Total Disponible</p>
                <p className="text-xs font-bold text-white uppercase italic">FedaPay Platform</p>
              </div>
              {lastFetch && (
                <div className="ml-auto flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">
                    {new Date(lastFetch).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-14">
              <h2 className="text-6xl md:text-7xl font-display font-bold tracking-tighter italic leading-none">
                {loading ? '--- ---' : connectionStatus === 'error' ? '---' : formatPrice(total)}
              </h2>
            </div>

            {/* Sub-balances by Network */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
              {balances.length > 0 ? balances.map((b, idx) => (
                <div key={idx} className="bg-white/5 p-4 flex justify-between items-center group hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{getNetworkName(b.mode)}</p>
                    <p className="text-lg font-bold italic">{formatPrice(b.amount)}</p>
                  </div>
                  <div className="opacity-20 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-primary-500" />
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-[10px] font-bold uppercase italic">
                  {connectionStatus === 'error' ? 'Connexion requise pour afficher les fonds.' : 'Aucun fond actif par réseau.'}
                </p>
              )}
            </div>
          </Card>

          {/* Withdrawal Form Card */}
          <Card className="p-10 border-none shadow-xl bg-white">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-primary-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="text-xl font-display font-bold uppercase italic">Initialiser un Retrait</h3>
            </div>

            <form onSubmit={handleWithdrawal} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Opérateur Réseau</label>
                <div className="grid grid-cols-2 gap-2">
                  {NETWORKS.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setNetwork(n.id)}
                      className={`p-4 border text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-2 transition-all ${
                        network === n.id 
                          ? 'border-primary-500 bg-primary-50 text-secondary' 
                          : 'border-gray-100 bg-gray-50 text-gray-400 grayscale hover:grayscale-0'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-white">
                        <img src={n.icon} alt={n.label} className="w-full h-full object-cover" />
                      </div>
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Numéro de Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text"
                      placeholder="90 00 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border-none px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Montant à retirer (FCFA)</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300">XOF</div>
                    <input 
                      type="number"
                      placeholder="Min. 500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-50 border-none px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={withdrawing || connectionStatus !== 'connected' || total <= 0}
                  className="w-full bg-secondary hover:bg-black text-white font-display italic tracking-widest text-lg py-8 shadow-2xl"
                >
                  {withdrawing ? 'TRAITEMENT EN COURS...' : 'CONFIRMER LE RETRAIT'}
                </Button>

                {success && (
                  <div className="p-4 bg-green-50 border border-green-100 flex items-center gap-3 animate-slide-up">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Demande initiée ! Vérifiez votre téléphone.</p>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="p-10 border-none shadow-xl bg-white space-y-8">
            <div className="pb-6 border-b border-gray-50">
                <h3 className="text-lg font-display font-bold uppercase italic flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  Règles de Retrait
                </h3>
            </div>
            
            <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Délai de réception</p>
                  <p className="text-xs font-bold text-secondary uppercase italic leading-loose">Quasi-instantané via Payout Automatique</p>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Frais FedaPay</p>
                  <p className="text-xs font-bold text-secondary uppercase italic">Inclus dans la transaction</p>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Limites</p>
                  <p className="text-xs font-bold text-secondary uppercase italic">Min: 500 FCFA / Max: Solde dispo.</p>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
                <div className="p-6 bg-secondary text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 -rotate-45 translate-x-8 -translate-y-8 rounded-full" />
                  <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed relative z-10">
                    Les retraits sont définitifs. Assurez-vous du numéro avant de valider.
                  </p>
                </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <Card className="p-10 border-none shadow-xl bg-white">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 flex items-center justify-center">
                <History className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold uppercase italic">Historique des Transactions</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Dernières transactions FedaPay</p>
              </div>
           </div>
           <button 
             onClick={fetchTransactions}
             className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-secondary transition-colors flex items-center gap-2"
           >
             <RefreshCw className={`w-3 h-3 ${loadingTx ? 'animate-spin' : ''}`} />
             Rafraîchir
           </button>
        </div>

        <div className="overflow-x-auto">
          {loadingTx ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Chargement des transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Réf.</th>
                  <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Description</th>
                  <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Montant</th>
                  <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                      </span>
                    </td>
                    <td className="py-5">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-mono">
                        {tx.reference || `#${tx.id}`}
                      </span>
                    </td>
                    <td className="py-5">
                      <div>
                        <p className="text-[10px] font-bold text-secondary truncate max-w-[200px]">{tx.description || 'Transaction'}</p>
                        {tx.customer && (
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {tx.customer.firstname} {tx.customer.lastname}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-5">
                      <span className={`text-sm font-bold italic ${tx.status === 'approved' ? 'text-green-600' : 'text-secondary'}`}>
                        {formatPrice(tx.amount)}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      {getStatusBadge(tx.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-[10px] font-bold text-gray-300 uppercase italic tracking-widest">
                {connectionStatus === 'error' 
                  ? 'Connexion à FedaPay requise pour afficher l\'historique.' 
                  : 'Aucune transaction récente trouvée.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Caisse;
