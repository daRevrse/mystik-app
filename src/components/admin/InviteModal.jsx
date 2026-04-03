import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Download, Share2, Check, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

const InviteModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const posterRef = useRef(null);
  
  const shopUrl = window.location.origin;

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
        scale: 3,
        useCORS: true,
        backgroundColor: '#1c1917'
      });
      const link = document.createElement('a');
      link.download = `mystik-poster-invite.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating poster:', err);
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
            
            {/* The Actual Poster Element to Capture */}
            <div 
              ref={posterRef}
              className="aspect-[4/5] bg-secondary text-white p-10 flex flex-col items-center justify-between text-center relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rotate-45 translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rotate-45 -translate-x-16 translate-y-16" />

              <div className="space-y-4 z-10">
                <img src="/images/mystik/logo mystik black.png" alt="Logo" className="w-20 h-20 mx-auto invert opacity-90" />
                <h3 className="text-2xl font-display font-black uppercase italic leading-none tracking-tight">
                  MYSTIK<br />
                  <span className="text-amber-500 text-xs">LEGEND'S DRINK</span>
                </h3>
              </div>

              <div className="bg-white p-4 shadow-2xl relative z-10 scale-110">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 animate-pulse" />
                )}
                <div className="absolute -top-2 -right-2 bg-amber-500 text-secondary p-1">
                   <QrCode className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2 z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Scannez pour commander</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">L'Esprit du Togo 🇹🇬</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
