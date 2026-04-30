'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfile(data || { display_name: user.email });
      setLoading(false);
    }
    
    getProfile();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F4F3F7] text-[#595959] font-bold text-xl">Loading your workspace...</div>;
  }

  // Live session view takes over the whole screen
  if (pathname.includes('/dashboard/session/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F3F7]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b-4 border-[#1A1A1A] sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#46178f] rounded-[0.5rem] flex items-center justify-center shadow-[0_2px_0_#1A1A1A] border-2 border-[#1A1A1A]">
            <Image src="/askly-logo.png" alt="Askly" width={16} height={16} className="brightness-0 invert" />
          </div>
          <span className="text-xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>Askly</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 border-2 border-[#1A1A1A] rounded-lg">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Playful Sidebar */}
      <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-72 flex flex-col border-b-4 md:border-b-0 md:border-r-4 border-[#1A1A1A] bg-white md:sticky md:top-0 md:h-screen z-40`}>
        <div className="p-6 md:p-8 flex-1">
          <Link href="/dashboard" className="hidden md:flex items-center gap-3 mb-12 transform hover:scale-105 transition-transform origin-left">
            <div className="w-12 h-12 bg-[#46178f] rounded-[1rem] flex items-center justify-center shadow-[0_4px_0_#1A1A1A] border-2 border-[#1A1A1A] transform -rotate-6">
              <Image src="/askly-logo.png" alt="Askly" width={28} height={28} className="brightness-0 invert" />
            </div>
            <span className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>Askly</span>
          </Link>
          
          <nav className="flex flex-col gap-4">
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-lg border-2 ${pathname === '/dashboard' ? 'bg-[#EAE6F2] text-[#46178f] border-[#46178f] shadow-[0_4px_0_#46178f]' : 'text-[#595959] border-transparent hover:bg-[#F4F3F7] hover:text-[#1A1A1A]'}`}
            >
              <LayoutDashboard size={24} />
              My Sessions
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t-4 border-[#1A1A1A] bg-[#FFB800]">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4 bg-white p-3 md:p-4 rounded-2xl border-2 border-[#1A1A1A] shadow-[0_4px_0_#1A1A1A]">
               <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-[#FF3366] flex items-center justify-center text-white font-black text-xl border-2 border-[#1A1A1A]">
                 {profile?.display_name?.charAt(0).toUpperCase() || '?'}
               </div>
               <div className="overflow-hidden flex-1">
                 <p className="font-black text-base md:text-lg truncate text-[#1A1A1A]">{profile?.display_name}</p>
                 <p className="text-xs md:text-sm font-bold text-[#595959] truncate">Professor</p>
               </div>
             </div>
             <button 
                onClick={handleLogout} 
                className="w-full flex justify-center items-center gap-2 bg-[#1A1A1A] text-white font-bold py-3 md:py-4 rounded-2xl border-2 border-transparent shadow-[0_4px_0_#000] hover:translate-y-[2px] hover:shadow-[0_2px_0_#000] transition-all"
             >
                <LogOut size={20} />
                Log Out
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
