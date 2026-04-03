import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Download, Share2, Check, QrCode, Tag, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { api } from '../../services/api';

const InviteModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [promoCodes, setPromoCodes] = useState([]);
  const [selectedPromoId, setSelectedPromoId] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const posterRef = useRef(null);
  
  const shopUrl = window.location.origin;

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const codes = await api.getPromoCodes();
        const activeCodes = codes.filter(c => c.active || c.isActive);
        setPromoCodes(activeCodes);
        if (activeCodes.length > 0) {
          setSelectedPromoId(activeCodes[0].id);
        }
      } catch (err) {
        console.error('Error fetching promos:', err);
      }
    };
    if (isOpen) fetchPromos();
  }, [isOpen]);

  const selectedPromo = promoCodes.find(p => p.id === selectedPromoId);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-invite-modal', handleOpen);
    
    if (isOpen) {
      QRCode.toDataURL(shopUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      }).then(url => setQrCodeUrl(url));
    }

    return () => window.removeEventListener('open-invite-modal', handleOpen);
  }, [isOpen, shopUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const downloadPoster = async () => {
    if (!posterRef.current) return;
    setGeneratingPoster(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 4, // Ultra high quality for social media
        useCORS: true,
        backgroundColor: '#0a0a0a',
        logging: false,
        onclone: (clonedDoc) => {
          const poster = clonedDoc.querySelector('[data-poster-container]');
          if (poster) {
            poster.style.width = '320px';
            poster.style.height = '400px';
            poster.style.display = 'flex';
          }
        }
      });
      const link = document.createElement('a');
      link.download = `mystik-poster-invite.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating poster:', err);
      alert("Erreur lors de la génération du poster. Vérifiez la console.");
    } finally {
      setGeneratingPoster(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 italic-none">
      <div 
        className="absolute inset-0 bg-secondary/90 backdrop-blur-md animate-fade-in"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-auto shadow-2xl animate-scale-in flex flex-col md:flex-row">
        {/* Left Side: Controls */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-display font-black uppercase italic text-secondary leading-none">
                Inviter des<br />
                <span className="text-amber-500">Clients</span>
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-1">Partagez l'expérience Mystik</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-8 flex-grow">
            {/* Link Copy */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-secondary mb-3">Lien de la boutique</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shopUrl}
                  className="flex-grow bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-bold text-gray-500 outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className={`px-4 flex items-center justify-center transition-all ${copying ? 'bg-green-500 text-white' : 'bg-secondary text-white hover:bg-black'}`}
                >
                  {copying ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Poster Preview Hint */}
            <div className="p-6 bg-amber-50 border border-amber-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-secondary mb-1">Générateur de Poster</h4>
                  <p className="text-[10px] text-amber-800/70 font-bold leading-relaxed uppercase tracking-wider">
                    Nous avons préparé un visuel premium avec votre logo et le QR code. Idéal pour Instagram, WhatsApp ou impression.
                  </p>
                </div>
              </div>
            </div>

            {/* Promotion Selector */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Promotion sur le poster</span>
                 </div>
                 <button 
                    onClick={() => setShowPromo(!showPromo)}
                    className={`w-10 h-5 transition-colors relative ${showPromo ? 'bg-amber-500' : 'bg-gray-200'}`}
                 >
                    <div className={`absolute top-1 w-3 h-3 bg-white transition-all ${showPromo ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>

              {showPromo && (
                <div className="animate-slide-up">
                  <select 
                    value={selectedPromoId}
                    onChange={(e) => setSelectedPromoId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-[11px] font-bold text-secondary outline-none appearance-none cursor-pointer"
                  >
                    {promoCodes.length > 0 ? (
                      promoCodes.map(promo => (
                        <option key={promo.id} value={promo.id}>
                          {promo.id} ({promo.discountType === 'percentage' ? `-${promo.discountValue}%` : `-${promo.discountValue} FCFA`})
                        </option>
                      ))
                    ) : (
                      <option disabled>Aucun code actif</option>
                    )}
                  </select>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-2 italic px-1">
                    * Le code sera affiché en bas du visuel.
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={downloadPoster}
              disabled={generatingPoster}
              className="w-full bg-amber-500 hover:bg-amber-600 text-secondary py-5 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {generatingPoster ? (
                <div className="w-5 h-5 border-2 border-secondary/20 border-t-secondary animate-spin rounded-full" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Télécharger le Poster
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Poster Preview */}
        <div className="bg-gray-100 p-8 md:p-12 md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-[320px] shadow-2xl overflow-hidden group relative">
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <p className="text-white text-[10px] font-black uppercase tracking-widest">Aperçu du visuel</p>
            </div>
            
            {/* The Actual Poster Element to Capture - Fixed dimensions for stable rendering */}
            <div 
              ref={posterRef}
              data-poster-container
              style={{ 
                backgroundColor: '#0a0a0a', 
                color: '#ffffff',
                width: '320px',
                height: '400px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px',
                margin: '0 auto'
              }}
            >
              {/* Discrete Decorative shapes (Simpler for capture stability) */}
              <div 
                style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', backgroundColor: '#f59e0b', opacity: 0.1, transform: 'rotate(45deg)' }} 
              />
              <div 
                style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '120px', height: '120px', backgroundColor: '#f59e0b', opacity: 0.1, transform: 'rotate(45deg)' }} 
              />

              {/* Header Logo */}
              <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <img 
                  src="/images/mystik/logo mystik black.png" 
                  alt="Logo" 
                  style={{ width: '48px', height: '48px' }} 
                />
              </div>

              {/* Brand Section */}
              <div style={{ textAlign: 'center', zIndex: 10, marginBottom: '20px' }}>
                <h3 style={{ fontSize: '22px', fontFamily: '"Playfair Display", serif', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', color: '#ffffff', letterSpacing: '0.15em', lineHeight: '1.2' }}>
                  MYSTIK
                </h3>
                <p style={{ color: '#f59e0b', fontSize: '8px', fontWeight: '900', letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: '2px' }}>
                  LEGEND'S DRINK
                </p>
              </div>

              {/* QR Code Section - Centered in free space */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, width: '100%' }}>
                <div 
                  style={{ backgroundColor: '#ffffff', border: '2px solid #f59e0b40', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', position: 'relative' }}
                >
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" style={{ width: '100px', height: '100px', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100px', height: '100px', backgroundColor: '#f3f4f6' }} />
                  )}
                  {/* Small Icon over QR */}
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#f59e0b', color: '#0a0a0a', padding: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                     <QrCode size={14} />
                  </div>
                </div>
              </div>

              {/* Promo Highlight - Dynamic insertion */}
              {showPromo && selectedPromo && (
                <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed #f59e0b', padding: '4px 12px' }}>
                      <Sparkles size={12} color="#f59e0b" />
                      <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.1em', margin: 0 }}>
                         OFFRE : <span style={{ color: '#f59e0b' }}>{selectedPromo.discountType === 'percentage' ? `-${selectedPromo.discountValue}%` : `-${selectedPromo.discountValue}F`}</span> CODE : <span style={{ color: '#f59e0b' }}>{selectedPromo.id}</span>
                      </p>
                   </div>
                </div>
              )}

              {/* Footer Section */}
              <div style={{ height: showPromo ? '60px' : '90px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '10px', zIndex: 10 }}>
                <div style={{ backgroundColor: '#f59e0b', color: '#0a0a0a', padding: '6px 20px', marginBottom: '12px', display: 'inline-block' }}>
                  <p style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', fontStyle: 'italic', margin: 0 }}>
                    Scannez pour commander
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                   <p style={{ fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#9ca3af', margin: 0 }}>
                      L'Esprit du Togo
                   </p>
                   <div style={{ width: '20px', height: '1px', backgroundColor: '#f59e0b', opacity: 0.3 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
