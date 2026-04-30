'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          role: 'professor'
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: name,
        role: 'professor'
      }, { onConflict: 'id' });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-main relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-pink opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="card w-full max-w-md relative z-10 flex-col p-10 border-border-strong shadow-2xl">
        <div className="text-center mb-8 flex-col items-center">
          <Link href="/" className="mb-8 inline-block">
            <Image src="/askly-logo.png" alt="Askly" width={40} height={40} />
          </Link>
          <h1 className="text-2xl font-bold mb-2 tracking-tight">Create Account</h1>
          <p className="text-secondary text-sm">Start hosting anonymous Q&A sessions.</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 border border-green-200 mx-auto flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Account Created!</h3>
            <p className="text-secondary">Redirecting to your workspace...</p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="flex-col gap-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <User size={18} className="text-text-tertiary" />
              </div>
              <input
                type="text"
                placeholder="Full Name (e.g. Dr. Smith)"
                className="input pl-11 py-3 bg-subtle border-transparent focus:bg-white focus:border-primary focus:ring-0"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Password (min 6 chars)"
                className="input pl-11 py-3 bg-subtle border-transparent focus:bg-white focus:border-primary focus:ring-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
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
              {loading ? 'Creating account...' : 'Sign Up'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border w-full text-center">
          <p className="text-sm text-secondary">
            Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
