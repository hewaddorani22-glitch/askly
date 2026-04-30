'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateSessionCode } from '@/lib/utils';
import { Plus, MessageSquare, X, ArrowRight, Play, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Confetti from 'react-confetti';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#46178f');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const loadSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    const { data } = await supabase
      .from('sessions')
      .select('*, questions(count)')
      .eq('professor_id', user.id)
      .order('created_at', { ascending: false });
      
    if (data) setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, [supabase]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;
    
    setCreating(true);
    setCreateError('');
    
    const code = generateSessionCode();
    
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        professor_id: user.id,
        title: newTitle.trim(),
        description: newDesc.trim(),
        session_code: code,
        accent_color: newColor
      })
      .select()
      .single();
      
    if (error) {
      setCreating(false);
      // Extremely helpful error message for the user if RLS is failing
      if (error.code === '42501') {
        setCreateError('Database Error (RLS): You do not have permission to insert into the sessions table. Please run the SQL command to disable Row Level Security on your Supabase tables.');
      } else {
        setCreateError(`Failed to create session: ${error.message}`);
      }
      return;
    }
      
    if (data) {
      setIsModalOpen(false);
      setShowConfetti(true);
      
      setTimeout(() => {
        router.push(`/dashboard/session/${data.id}`);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-12 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 md:h-12 w-48 md:w-64 bg-[#EAE6F2] rounded-full mb-8 md:mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {[1,2,3].map(i => <div key={i} className="h-56 md:h-64 bg-white rounded-[2rem] border-4 border-[#EAE6F2]"></div>)}
        </div>
      </div>
    );
  }

  const activeSessions = sessions.filter(s => s.is_active);
  const pastSessions = sessions.filter(s => !s.is_active);

  return (
    <div className="p-6 md:p-12 max-w-[1400px] mx-auto relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} gravity={0.15} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-16 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 md:mb-4 text-[#1A1A1A]">Your Rooms</h1>
          <p className="text-lg md:text-xl text-[#595959] font-medium">Manage your active and past Q&A sessions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn w-full md:w-auto bg-[#00C896] text-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[0_6px_0_#1A1A1A] hover:translate-y-[2px] hover:shadow-[0_4px_0_#1A1A1A] px-6 md:px-8 py-4 md:py-5 text-lg md:text-xl font-black rounded-full"
        >
          <Plus size={24} strokeWidth={3} />
          Create Room
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] text-center p-10 md:p-20 flex flex-col items-center border-4 border-dashed border-[#CCCCCC] shadow-[8px_8px_0_#EAE6F2]">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#EAE6F2] flex items-center justify-center mb-6 md:mb-8 transform -rotate-12">
            <MessageSquare size={32} className="md:w-10 md:h-10 text-[#46178f]" strokeWidth={3} />
          </div>
          <h3 className="text-3xl md:text-4xl font-black mb-4">No rooms yet!</h3>
          <p className="text-lg md:text-xl text-[#595959] mb-8 md:mb-10 max-w-md font-medium">Create your first room to get a code and start receiving questions from your students instantly.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn bg-[#46178f] text-white border-4 border-[#1A1A1A] shadow-[0_6px_0_#1A1A1A] hover:translate-y-[2px] hover:shadow-[0_4px_0_#1A1A1A] px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl rounded-full w-full sm:w-auto">
            Start a Session Now
          </button>
        </div>
      ) : (
        <div className="space-y-12 md:space-y-16">
           {activeSessions.length > 0 && (
             <section>
               <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] mb-6 md:mb-8 flex items-center gap-3">
                 <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#FF3366] animate-pulse"></div> 
                 Live Now
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                 {activeSessions.map(session => (
                   <SessionCard key={session.id} session={session} />
                 ))}
               </div>
             </section>
           )}

           {pastSessions.length > 0 && (
             <section>
               <h3 className="text-xl md:text-2xl font-black text-[#8C8C8C] mb-6 md:mb-8 flex items-center gap-3">
                 <Clock size={24} /> Previous Rooms
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 opacity-80 hover:opacity-100 transition-opacity duration-300">
                 {pastSessions.map(session => (
                   <SessionCard key={session.id} session={session} />
                 ))}
               </div>
             </section>
           )}
        </div>
      )}

      {/* Massive Fun Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#46178f]/40 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl relative animate-pop rounded-[2rem] md:rounded-[2.5rem] border-4 border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A] md:shadow-[16px_16px_0_#1A1A1A] p-6 md:p-10 my-8">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-[#1A1A1A] hover:bg-[#EAE6F2] transition-colors p-2 md:p-3 rounded-full"
            >
              <X size={24} strokeWidth={3} />
            </button>
            
            <h2 className="text-3xl md:text-4xl font-black mb-6 md:mb-8 tracking-tight pr-10">New Room</h2>
            
            {createError && (
              <div className="mb-6 p-4 bg-[#FFF0F4] border-2 border-[#FF3366] rounded-xl flex items-start gap-3 text-[#FF3366]">
                <AlertTriangle size={24} className="shrink-0 mt-0.5" />
                <p className="font-bold text-sm md:text-base">{createError}</p>
              </div>
            )}
            
            <form onSubmit={handleCreateSession} className="flex flex-col gap-6 md:gap-8">
              <div>
                <label className="block text-base md:text-lg font-bold text-[#1A1A1A] mb-2 md:mb-3">Room Title</label>
                <input
                  type="text"
                  className="w-full text-xl md:text-2xl font-bold py-4 px-5 md:py-5 md:px-6 bg-[#F4F3F7] border-4 border-[#E0E0E0] rounded-[1.25rem] md:rounded-[1.5rem] focus:bg-white focus:outline-none focus:border-[#46178f] focus:shadow-[0_4px_0_#46178f] transition-all"
                  placeholder="e.g. Physics 101"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              
              <div>
                <label className="block text-base md:text-lg font-bold text-[#1A1A1A] mb-2 md:mb-3">Topic <span className="text-[#8C8C8C] font-medium">(Optional)</span></label>
                <input
                  type="text"
                  className="w-full text-lg md:text-xl font-medium py-3 px-5 md:py-4 md:px-6 bg-[#F4F3F7] border-4 border-[#E0E0E0] rounded-xl md:rounded-[1.25rem] focus:bg-white focus:outline-none focus:border-[#46178f] focus:shadow-[0_4px_0_#46178f] transition-all"
                  placeholder="e.g. Thermodynamics"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-base md:text-lg font-bold text-[#1A1A1A] mb-3 md:mb-4">Choose a Theme</label>
                <div className="flex flex-wrap gap-3 md:gap-4">
                  {['#46178f', '#FF3366', '#00C896', '#FFB800', '#2B75FF'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full transition-all border-4 shadow-[0_4px_0_#1A1A1A]"
                      style={{ 
                        backgroundColor: color,
                        borderColor: newColor === color ? '#1A1A1A' : 'transparent',
                        transform: newColor === color ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                        boxShadow: newColor === color ? '0 8px 0 #1A1A1A' : '0 4px 0 #1A1A1A'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-[#1A1A1A] text-white font-black text-xl md:text-2xl py-4 md:py-6 rounded-full border-4 border-transparent shadow-[0_6px_0_#000] md:shadow-[0_8px_0_#000] hover:translate-y-[4px] hover:shadow-[0_2px_0_#000] md:hover:shadow-[0_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 md:mt-4 flex justify-center items-center gap-2 md:gap-3"
                disabled={creating || !newTitle.trim()}
              >
                {creating ? 'Starting...' : 'Let\'s Go!'}
                {!creating && <Play size={24} fill="currentColor" className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session }: { session: any }) {
  return (
    <Link href={`/dashboard/session/${session.id}`} className="block h-full outline-none">
      <div 
        className="h-full flex flex-col p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-4 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] md:shadow-[8px_8px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[10px_10px_0_#1A1A1A] md:hover:shadow-[12px_12px_0_#1A1A1A] transition-all duration-300 relative overflow-hidden group bg-white"
      >
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rounded-bl-[3rem] md:rounded-bl-[4rem] opacity-20 transform translate-x-6 -translate-y-6 md:translate-x-8 md:-translate-y-8 group-hover:scale-125 transition-transform duration-500" style={{ backgroundColor: session.accent_color }}></div>
        
        <div className="flex flex-col mb-4 md:mb-6 relative z-10">
          {session.is_active && (
            <span className="badge bg-[#FF3366] text-white mb-3 md:mb-4 self-start text-[10px] md:text-xs tracking-widest border-2 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A]">LIVE NOW</span>
          )}
          <h3 className="font-black text-2xl md:text-3xl leading-tight text-[#1A1A1A] pr-8">{session.title}</h3>
        </div>
        
        <p className="text-base md:text-xl text-[#595959] font-medium mb-6 md:mb-8 line-clamp-2 flex-1 relative z-10">
          {session.description || 'No specific topic.'}
        </p>
        
        <div className="flex justify-between items-center pt-4 md:pt-6 border-t-[3px] border-[#E0E0E0] mt-auto relative z-10">
          <div className="px-3 py-1.5 md:px-4 md:py-2 bg-[#F4F3F7] rounded-xl text-base md:text-lg font-black tracking-widest text-[#1A1A1A] border-2 border-[#1A1A1A]">
            {session.session_code}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-lg md:text-xl font-black text-[#1A1A1A]">
            <MessageSquare size={20} className="md:w-6 md:h-6 text-[#2B75FF]" fill="#2B75FF" />
            {session.questions[0]?.count || 0}
          </div>
        </div>
      </div>
    </Link>
  );
}
