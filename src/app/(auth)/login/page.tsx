'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-main relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-teal opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="card w-full max-w-md relative z-10 flex-col p-10 border-border-strong shadow-2xl">
        <div className="text-center mb-8 flex-col items-center">
          <Link href="/" className="mb-8 inline-block">
            <Image src="/askly-logo.png" alt="Askly" width={40} height={40} />
          </Link>
          <h1 className="text-2xl font-bold mb-2 tracking-tight">Welcome back</h1>
          <p className="text-secondary text-sm">Log in to your professor workspace.</p>
        </div>

        <form onSubmit={handleLogin} className="flex-col gap-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-text-tertiary" />
            </div>
            <input
              type="email"
              placeholder="University Email"
              className="input pl-11 py-3 bg-subtle border-transparent focus:bg-white focus:border-primary focus:ring-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-text-tertiary" />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="input pl-11 py-3 bg-subtle border-transparent focus:bg-white focus:border-primary focus:ring-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2 py-3"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border w-full text-center">
          <p className="text-sm text-secondary">
            Don't have an account? <Link href="/signup" className="font-medium text-primary hover:underline">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
