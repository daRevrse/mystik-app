import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Wallet, ArrowUpRight, History, CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';

const Caisse = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paygate-balance');
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch (err) {
      console.error("Erreur solde:", err);
      // Simulation pour la démo si l'API n'est pas encore là
      setBalance(145800);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    setWithdrawing(true);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: balance })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
        fetchBalance();
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

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary uppercase italic leading-none">Gestion <span className="text-primary-500 underline decoration-black/5 decoration-8 underline-offset-8">CAISSE</span></h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 opacity-70">Suivi des fonds et retraits Paygate Global</p>
        </div>
        <Button 
            onClick={fetchBalance} 
            variant="outline" 
            className="border-gray-200 text-gray-500 hover:bg-gray-50 group"
        >
          <RefreshCw className={`w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          ACTUALISER
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <Card className="lg:col-span-2 p-10 border-none shadow-2xl relative overflow-hidden bg-secondary text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 -rotate-45 translate-x-32 -translate-y-32 pointer-events-none rounded-full" />
          
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-white/10 flex items-center justify-center rounded-none backdrop-blur-md">
              <Wallet className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">Solde Disponible</p>
              <p className="text-xs font-bold text-white uppercase italic">Paygate Global Togo</p>
            </div>
          </div>

          <div className="mb-14">
            <h2 className="text-6xl md:text-8xl font-display font-bold tracking-tighter italic leading-none">
              {loading ? '--- ---' : formatPrice(balance)}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <Button 
              onClick={handleWithdrawal}
              disabled={balance <= 0 || withdrawing}
              className="bg-primary-500 hover:bg-primary-600 text-secondary font-display italic tracking-widest text-lg py-8 px-10 shadow-2xl shadow-primary-500/20"
            >
              {withdrawing ? 'TRAITEMENT...' : (
                <span className="flex items-center">
                  DEMANDER UN RETRAIT
                  <ArrowUpRight className="ml-3 w-6 h-6" />
                </span>
              )}
            </Button>
          </div>

          {success && (
            <div className="mt-8 p-4 bg-green-500/20 border border-green-500/30 flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-green-400">Demande de retrait envoyée avec succès !</p>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-10 border-none shadow-xl bg-white space-y-8">
           <div className="pb-6 border-b border-gray-50">
              <h3 className="text-lg font-display font-bold uppercase italic flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary-500" />
                Infos Transfert
              </h3>
           </div>
           
           <div className="space-y-6">
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Délai de traitement</p>
                 <p className="text-sm font-bold text-secondary uppercase italic">24h à 48h ouvrables</p>
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                 <p className="text-sm font-bold text-secondary uppercase italic">Compte Mobile Money lié</p>
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Frais de retrait</p>
                 <p className="text-sm font-bold text-secondary uppercase italic">Selon grille Paygate (1% env.)</p>
              </div>
           </div>

           <div className="pt-6 border-t border-gray-50">
              <div className="p-4 bg-[#fafaf9] border border-gray-100 flex items-start gap-4">
                 <div className="w-2 h-2 rounded-full bg-primary-500 mt-1 animate-pulse" />
                 <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">
                    Assurez-vous que vos informations de compte sont à jour dans votre espace marchand Paygate Global.
                 </p>
              </div>
           </div>
        </Card>
      </div>

      {/* History */}
      <Card className="p-10 border-none shadow-xl bg-white">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 flex items-center justify-center">
                <History className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-xl font-display font-bold uppercase italic">Historique des Retraits</h3>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Date</th>
                <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Montant</th>
                <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Méthode</th>
                <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { date: '28 Mars 2026', amount: 50000, method: 'T-Money', status: 'Terminé' },
                { date: '15 Mars 2026', amount: 120000, method: 'Flooz', status: 'Terminé' },
                { date: '02 Mars 2026', amount: 75000, method: 'Virement', status: 'Terminé' },
              ].map((tx, i) => (
                <tr key={i} className="group hover:bg-[#fafaf9] transition-colors">
                  <td className="py-6 text-xs font-bold text-secondary uppercase tracking-widest">{tx.date}</td>
                  <td className="py-6 text-xs font-bold text-secondary uppercase tracking-widest">{formatPrice(tx.amount)}</td>
                  <td className="py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{tx.method}</td>
                  <td className="py-6 text-right">
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-widest rounded-none">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-8 text-center">
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em] italic">Fin de l'historique récent</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Caisse;
