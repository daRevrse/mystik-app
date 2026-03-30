import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'mystik2024' || password === 'admin') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('Code d\'accès incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
        <img src="/images/mystik/logo mystik black.png" alt="" className="w-[500px] absolute -top-40 -left-40 rotate-12" />
        <div className="absolute inset-0 bg-secondary/80" />
      </div>
      
      <Card className="max-w-md w-full relative z-10 bg-white shadow-2xl p-10 animate-fade-in border-none rounded-none">
        <div className="text-center mb-10">
          <img src="/images/mystik/logo mystik.png" alt="Mystik" className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-4xl font-display font-bold text-secondary uppercase italic leading-none">
            Espace <br/><span className="text-primary-500">Mystik.</span>
          </h1>
          <p className="text-gray-400 text-[10px] mt-4 font-bold tracking-[0.3em] uppercase">
            Administration Réservée
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-4 border-b-2 border-gray-100 focus:border-primary-500 focus:ring-0 outline-none transition-colors text-center text-xl tracking-[0.5em] bg-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold text-center tracking-widest uppercase animate-pulse">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-xs font-bold tracking-[0.2em] bg-primary-500 text-secondary hover:bg-secondary hover:text-white transition-all duration-300">
            DÉVERROUILLER
          </Button>
        </form>
      </Card>
      
      <div className="absolute bottom-6 text-center w-full z-10">
         <span className="text-primary-500/50 text-[10px] font-bold tracking-[0.5em] uppercase italic">Legend's Drink</span>
      </div>
    </div>
  );
};

export default Login;
