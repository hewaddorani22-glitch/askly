'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setError('Oops! You need a 6-character code.');
      return;
    }

    setLoading(true);
    
    const { data: session, error: sbError } = await supabase
      .from('sessions')
      .select('id, is_active')
      .eq('session_code', cleanCode)
      .single();

    if (sbError || !session) {
      setError('Hmm, we couldn\'t find that session.');
      setLoading(false);
      return;
    }

    if (!session.is_active) {
      setError('This session has already ended.');
      setLoading(false);
      return;
    }

    router.push(`/session/${cleanCode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#46178f] relative overflow-hidden">
      {/* Playful Shapes */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-[#FF3366] rounded-full opacity-50 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#00C896] rounded-[2rem] rotate-12 opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 -left-10 w-20 h-20 bg-[#FFB800] rounded-full opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white w-full max-w-lg relative z-10 flex-col items-center p-12 rounded-[2.5rem] border-4 border-[#1A1A1A] shadow-[12px_12px_0_#1A1A1A] transform transition-transform hover:-translate-y-1">
        <Link href="/" className="mb-8 inline-block transform transition-transform hover:scale-110">
          <div className="w-16 h-16 bg-[#46178f] rounded-[1.2rem] flex items-center justify-center shadow-[0_4px_0_#1A1A1A] border-[3px] border-[#1A1A1A] transform -rotate-6">
            <Image src="/askly-logo.png" alt="Askly" width={32} height={32} className="brightness-0 invert" />
          </div>
        </Link>
        
        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] font-black mb-2 leading-tight">Enter Game PIN</h1>
          <p className="text-[#595959] text-lg font-medium">Type the 6-character code on the screen.</p>
        </div>

        <form onSubmit={handleJoin} className="w-full flex-col gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. A8K9M2"
              className="w-full text-center text-3xl font-black tracking-[0.2em] uppercase font-mono py-6 px-4 bg-[#F4F3F7] border-4 border-[#1A1A1A] rounded-[1.5rem] focus:bg-white focus:outline-none focus:border-[#46178f] focus:shadow-[0_0_0_8px_rgba(70,23,143,0.15)] transition-all"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-lg text-center p-4 rounded-[1rem] border-2 border-[#FF3366] bg-[#FFF0F4] text-[#FF3366] font-bold animate-pop">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-[#1A1A1A] text-white font-black text-2xl py-6 rounded-full border-4 border-transparent shadow-[0_8px_0_#000] hover:translate-y-[4px] hover:shadow-[0_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            disabled={loading || code.length < 6}
          >
            {loading ? 'Joining...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
