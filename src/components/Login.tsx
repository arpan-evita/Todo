import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Mail, Zap } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('PILOT IDENTITY REGISTERED. CHECK COMMS (EMAIL).');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage(error.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="glass-card" style={{ maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
        <div className="w-20 h-20 rounded-2xl bg-cyan-400 flex items-center justify-center mb-10 mx-auto shadow-[0_0_40px_rgba(0,242,255,0.4)]">
           <Zap size={44} className="text-black" strokeWidth={3} />
        </div>
        
        <h2 className="text-3xl font-black text-white italic tracking-widest uppercase mb-2">PILOT AUTH</h2>
        <p className="label-caps text-cyan-400 mb-10 opacity-60" style={{ fontSize: '10px' }}>Global Command Sync v3.0</p>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="login-input-group">
            <Mail className="login-icon" size={20} />
            <input 
              type="email" 
              placeholder="PILOT EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="login-input-group">
            <Lock className="login-icon" size={20} />
            <input 
              type="password" 
              placeholder="ENCRYPTION KEY"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="login-btn"
          >
            {loading ? 'SYNCING...' : isSignUp ? 'INITIALIZE PROFILE' : 'ACCESS DASHBOARD'}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '12px' }}>
            <p style={{ fontSize: '10px', color: '#ff3b30', fontWeight: '900', letterSpacing: '1px' }}>
              {message}
            </p>
          </div>
        )}

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ marginTop: '30px', background: 'none', border: 'none', color: '#666', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', cursor: 'pointer' }}
        >
          {isSignUp ? 'Already registered? Login here' : 'New Pilot? Register for Global ID'}
        </button>
      </div>
    </div>
  );
}
