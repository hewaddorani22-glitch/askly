'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/utils';
import { ChevronLeft, Check, X, Pin, Power, Copy, CheckCircle2, Search, Maximize2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Confetti from 'react-confetti';

export default function ProfessorSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const sessionId = unwrappedParams.id;
  const router = useRouter();
  const supabase = createClient();
  
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered' | 'dismissed'>('all');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('professor_id', user.id)
        .single();
        
      if (sessionError || !sessionData) {
        router.push('/dashboard');
        return;
      }
      
      setSession(sessionData);

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('upvote_count', { ascending: false });
        
      if (questionsData) {
        setQuestions(questionsData);
      }
      
      setLoading(false);

      const channel = supabase.channel(`prof_session_${sessionId}`)
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'questions',
            filter: `session_id=eq.${sessionId}`
        }, (payload) => {
            if (payload.eventType === 'INSERT') {
                setQuestions(prev => [payload.new, ...prev].sort((a, b) => {
                  if (a.status === 'pinned' && b.status !== 'pinned') return -1;
                  if (b.status === 'pinned' && a.status !== 'pinned') return 1;
                  return b.upvote_count - a.upvote_count;
                }));
            } else if (payload.eventType === 'UPDATE') {
                setQuestions(prev => prev.map(q => q.id === payload.new.id ? payload.new : q).sort((a, b) => {
                  if (a.status === 'pinned' && b.status !== 'pinned') return -1;
                  if (b.status === 'pinned' && a.status !== 'pinned') return 1;
                  return b.upvote_count - a.upvote_count;
                }));
            } else if (payload.eventType === 'DELETE') {
                setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
            }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    
    loadSession();
  }, [sessionId, supabase, router]);

  const updateQuestionStatus = async (questionId: string, status: string) => {
    if (status === 'answered') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, status } : q
    ).sort((a, b) => {
      const aPinned = a.id === questionId ? status === 'pinned' : a.status === 'pinned';
      const bPinned = b.id === questionId ? status === 'pinned' : b.status === 'pinned';
      if (aPinned && !bPinned) return -1;
      if (bPinned && !aPinned) return 1;
      return b.upvote_count - a.upvote_count;
    }));
    
    await supabase.from('questions').update({ status }).eq('id', questionId);
  };

  const endSession = async () => {
    if (!confirm("Are you sure you want to end this session? Students won't be able to ask more questions.")) return;
    await supabase.from('sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', sessionId);
    setSession({ ...session, is_active: false });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(session.session_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F3F7] text-[#1A1A1A] font-black text-2xl">Loading Room...</div>;

  const filteredQuestions = questions.filter(q => {
    if (filter === 'all') return true;
    if (filter === 'unanswered') return q.status === 'active' || q.status === 'pinned';
    return q.status === filter;
  });

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/session/${session.session_code}` : '';

  return (
    <div className="h-screen flex flex-col bg-[#F4F3F7] overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} gravity={0.3} />}

      {/* Responsive Header */}
      <header className="bg-white border-b-4 border-[#1A1A1A] h-auto md:h-24 shrink-0 z-50 shadow-[0_4px_0_rgba(0,0,0,0.05)]">
        <div className="h-full px-4 md:px-8 py-4 md:py-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start">
            <Link href="/dashboard" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#EAE6F2] flex items-center justify-center text-[#1A1A1A] hover:bg-[#46178f] hover:text-white transition-colors border-2 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] shrink-0">
              <ChevronLeft size={20} className="md:w-6 md:h-6" strokeWidth={3} />
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4 flex-1">
              <h1 className="font-black text-xl md:text-3xl text-[#1A1A1A] truncate">{session.title}</h1>
              {session.is_active ? (
                <span className="bg-[#FF3366] text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-black tracking-widest border-2 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] flex items-center gap-2 shrink-0">
                  <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white rounded-full animate-pulse"></span> LIVE
                </span>
              ) : (
                <span className="bg-[#EAE6F2] text-[#8C8C8C] px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-black tracking-widest border-2 border-[#CCCCCC] shrink-0">ENDED</span>
              )}
            </div>
            {/* End button on mobile goes here if needed, but we'll put it with the code */}
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6">
            <div className="flex items-center bg-white rounded-xl md:rounded-[1.5rem] p-1 md:p-1.5 pr-3 md:pr-4 border-2 md:border-4 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] flex-1 md:flex-none">
              <div className="bg-[#FFB800] text-[#1A1A1A] font-mono font-black text-lg md:text-2xl tracking-[0.2em] px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border-2 border-[#1A1A1A] mr-2 md:mr-4">
                {session.session_code}
              </div>
              <button onClick={copyCode} className="text-[#1A1A1A] hover:text-[#46178f] transition-colors font-bold flex items-center gap-1.5 md:gap-2 text-sm md:text-lg whitespace-nowrap ml-auto">
                {copied ? <Check size={16} className="md:w-5 md:h-5 text-[#00C896]" strokeWidth={3} /> : <Copy size={16} className="md:w-5 md:h-5" strokeWidth={3} />} <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            
            {session.is_active && (
              <button onClick={endSession} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-[#FF3366] hover:bg-[#FF3366] hover:text-white transition-colors border-2 md:border-4 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] shrink-0" title="End Session">
                <Power size={18} className="md:w-5 md:h-5" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Feed */}
        <div className="flex-1 flex flex-col bg-[#F4F3F7] overflow-hidden order-2 lg:order-1">
          <div className="px-4 md:px-8 py-4 md:py-6 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 md:gap-3 bg-white p-1.5 md:p-2 rounded-xl md:rounded-2xl border-2 md:border-4 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] shrink-0">
              <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} count={questions.length} />
              <FilterBtn label="Pending" active={filter === 'unanswered'} onClick={() => setFilter('unanswered')} count={questions.filter(q => q.status === 'active' || q.status === 'pinned').length} />
              <FilterBtn label="Answered" active={filter === 'answered'} onClick={() => setFilter('answered')} count={questions.filter(q => q.status === 'answered').length} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 scroll-smooth">
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
              {filteredQuestions.length === 0 ? (
                <div className="py-16 md:py-32 flex items-center justify-center flex-col text-[#595959] border-4 border-dashed border-[#CCCCCC] rounded-[2rem] md:rounded-[3rem] bg-white text-center px-4">
                  <Search size={48} className="md:w-16 md:h-16 mb-4 md:mb-6 text-[#EAE6F2]" strokeWidth={3} />
                  <p className="text-2xl md:text-3xl font-black text-[#1A1A1A] mb-2">It's quiet here...</p>
                  <p className="text-lg md:text-xl font-medium">Tell your students to join the room!</p>
                </div>
              ) : (
                filteredQuestions.map(q => (
                  <div key={q.id} className={`flashcard flex flex-col sm:flex-row gap-4 md:gap-6 p-4 md:p-6 ${q.status === 'pinned' ? 'border-4 border-[#FF3366] shadow-[6px_6px_0_#FF3366] md:shadow-[8px_8px_0_#FF3366] md:scale-[1.02]' : 'border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] md:shadow-[6px_6px_0_#1A1A1A]'} ${q.status === 'answered' ? 'opacity-50 scale-95 hover:opacity-100 hover:scale-100' : ''}`}>
                    {/* Top row on mobile: Upvotes + Metadata */}
                    <div className="flex sm:hidden items-center justify-between border-b-2 border-[#EAE6F2] pb-3 mb-1">
                      <div className="flex items-center gap-3">
                         <div className="flex items-center justify-center px-3 py-1 bg-[#EAE6F2] rounded-lg border-2 border-[#1A1A1A] gap-2">
                            <span className="font-mono text-xl font-black text-[#1A1A1A] leading-none">{q.upvote_count}</span>
                            <span className="text-[10px] uppercase font-black text-[#595959] tracking-widest leading-none mt-0.5">Votes</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {q.status === 'pinned' && <span className="bg-[#FF3366] text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-[#1A1A1A]">📌 Pinned</span>}
                        {q.status === 'answered' && <span className="bg-[#00C896] text-[#1A1A1A] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-[#1A1A1A]">✓ Done</span>}
                        {q.is_duplicate && <span className="bg-[#FFB800] text-[#1A1A1A] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-[#1A1A1A]">Similar</span>}
                      </div>
                    </div>

                    {/* Upvotes (Desktop) */}
                    <div className="hidden sm:flex flex-col items-center justify-center shrink-0 w-20 h-20 md:w-24 md:h-24 bg-[#EAE6F2] rounded-[1.25rem] md:rounded-[1.5rem] border-2 border-[#1A1A1A]">
                      <span className="font-mono text-3xl md:text-4xl font-black text-[#1A1A1A] leading-none mb-1">{q.upvote_count}</span>
                      <span className="text-[10px] md:text-xs uppercase font-black text-[#595959] tracking-widest leading-none">Votes</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="hidden sm:flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        {q.status === 'pinned' && <span className="bg-[#FF3366] text-white px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-[#1A1A1A]">📌 Pinned</span>}
                        {q.status === 'answered' && <span className="bg-[#00C896] text-[#1A1A1A] px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-[#1A1A1A]">✓ Done</span>}
                        {q.is_duplicate && <span className="bg-[#FFB800] text-[#1A1A1A] px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-[#1A1A1A]">Similar</span>}
                        <span className="text-xs md:text-sm text-[#8C8C8C] font-bold ml-auto">{timeAgo(q.created_at)}</span>
                      </div>
                      <p className="text-xl md:text-2xl text-[#1A1A1A] font-bold leading-snug">{q.content}</p>
                      {/* Mobile timestamp */}
                      <span className="sm:hidden text-xs text-[#8C8C8C] font-bold mt-2">{timeAgo(q.created_at)}</span>
                    </div>

                    {/* Giant Actions (Row on mobile, Col on desktop) */}
                    <div className="flex sm:flex-col justify-end sm:justify-center gap-2 md:gap-3 shrink-0 pt-3 sm:pt-0 sm:pl-4 md:pl-6 border-t-2 sm:border-t-0 sm:border-l-4 border-dashed border-[#EAE6F2]">
                      {q.status !== 'answered' && (
                        <button onClick={() => updateQuestionStatus(q.id, 'answered')} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white border-2 md:border-4 border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] hover:bg-[#00C896] hover:-translate-y-1 hover:shadow-[0_4px_0_#1A1A1A] md:hover:shadow-[0_6px_0_#1A1A1A] transition-all" title="Mark Answered">
                          <Check size={24} className="md:w-7 md:h-7" strokeWidth={4} />
                        </button>
                      )}
                      {q.status !== 'pinned' && q.status !== 'dismissed' && q.status !== 'answered' && (
                        <button onClick={() => updateQuestionStatus(q.id, 'pinned')} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white border-2 md:border-4 border-[#1A1A1A] flex items-center justify-center text-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] hover:bg-[#FF3366] hover:text-white hover:-translate-y-1 hover:shadow-[0_4px_0_#1A1A1A] md:hover:shadow-[0_6px_0_#1A1A1A] transition-all" title="Pin to top">
                          <Pin size={20} className="md:w-6 md:h-6" strokeWidth={3} />
                        </button>
                      )}
                      {q.status === 'pinned' && (
                        <button onClick={() => updateQuestionStatus(q.id, 'active')} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#FF3366] border-2 md:border-4 border-[#1A1A1A] flex items-center justify-center text-white shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] hover:bg-[#1A1A1A] transition-all" title="Unpin">
                          <Pin size={20} className="md:w-6 md:h-6 rotate-45" strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Playful Right Panel - Scrolls on mobile, fixed on desktop */}
        <aside className="w-full lg:w-[400px] bg-white border-b-4 lg:border-b-0 lg:border-l-4 border-[#1A1A1A] flex flex-col shrink-0 z-10 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] lg:shadow-[-8px_0_24px_rgba(0,0,0,0.05)] order-1 lg:order-2 overflow-y-auto max-h-[40vh] lg:max-h-none">
          <div className="p-6 md:p-8 border-b-4 border-[#E0E0E0]">
            <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] mb-4 md:mb-6 hidden lg:block">Join the Game!</h3>
            
            <div className="bg-[#F4F3F7] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] md:shadow-[8px_8px_0_#1A1A1A] flex flex-row lg:flex-col items-center justify-center relative group overflow-hidden gap-6 lg:gap-0">
              <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-[#FFB800] rounded-bl-[2rem] md:rounded-bl-[3rem] transform translate-x-4 -translate-y-4"></div>
              
              <button 
                onClick={() => setQrModalOpen(true)}
                className="absolute top-2 right-2 md:top-4 md:right-4 p-2 md:p-3 bg-white rounded-full shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] border-2 border-[#1A1A1A] text-[#1A1A1A] hover:scale-110 transition-transform z-10"
                title="Fullscreen QR Code"
              >
                <Maximize2 size={16} className="md:w-5 md:h-5" strokeWidth={3} />
              </button>
              
              <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-[0_4px_0_rgba(0,0,0,0.1)] md:shadow-[0_8px_0_rgba(0,0,0,0.1)] border-4 border-[#1A1A1A] lg:mb-6 relative z-10 shrink-0">
                <QRCodeSVG value={joinUrl} size={120} className="md:w-[180px] md:h-[180px]" level="H" includeMargin={false} />
              </div>
              
              <div className="flex flex-col items-center z-10">
                <p className="text-base md:text-xl text-[#1A1A1A] font-black text-center bg-[#FFB800] px-4 py-1.5 md:px-6 md:py-2 rounded-full border-2 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] lg:rotate-2 whitespace-nowrap mb-2 lg:mb-0">Scan me!</p>
                <p className="text-xs font-bold text-[#8C8C8C] mt-2 lg:hidden">or go to: <span className="text-[#46178f] font-mono">{typeof window !== 'undefined' ? window.location.host : 'askly.app'}/join</span></p>
              </div>
            </div>
            
            <div className="text-center mt-6 md:mt-8 hidden lg:block">
              <p className="text-base md:text-lg font-bold text-[#8C8C8C] mb-2">Or go to:</p>
              <p className="text-lg md:text-xl font-black text-[#46178f] font-mono bg-[#EAE6F2] p-3 md:p-4 rounded-xl md:rounded-2xl border-4 border-dashed border-[#CCCCCC] select-all break-all">{typeof window !== 'undefined' ? window.location.host : 'askly.app'}/join</p>
            </div>
          </div>

          <div className="p-6 md:p-8 hidden lg:block">
             <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] mb-4 md:mb-6">Live Stats</h3>
             <div className="space-y-3 md:space-y-4">
               <div className="flex justify-between items-center p-4 md:p-5 bg-[#EAE6F2] rounded-xl md:rounded-2xl border-2 border-[#CCCCCC]">
                 <span className="text-lg md:text-xl font-bold text-[#595959]">Received</span>
                 <span className="font-black text-xl md:text-2xl text-[#1A1A1A]">{questions.length}</span>
               </div>
               <div className="flex justify-between items-center p-4 md:p-5 bg-white rounded-xl md:rounded-2xl border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] transform lg:scale-105">
                 <span className="text-lg md:text-xl font-black text-[#1A1A1A]">Pending</span>
                 <span className="font-black text-2xl md:text-3xl text-[#FF3366]">{questions.filter(q => q.status === 'active' || q.status === 'pinned').length}</span>
               </div>
             </div>
          </div>
        </aside>
      </main>

      {/* Massive Fullscreen QR Modal */}
      {qrModalOpen && (
         <div className="fixed inset-0 bg-[#46178f]/90 backdrop-blur-lg z-[100] flex flex-col items-center justify-center p-4 md:p-8 animate-pop overflow-y-auto">
            <button onClick={() => setQrModalOpen(false)} className="absolute top-4 right-4 md:top-10 md:right-10 bg-white border-4 border-[#1A1A1A] shadow-[0_4px_0_#1A1A1A] md:shadow-[0_6px_0_#1A1A1A] text-[#1A1A1A] hover:bg-[#FF3366] hover:text-white p-3 md:p-4 rounded-full transition-colors z-10">
               <X size={32} className="md:w-10 md:h-10" strokeWidth={4} />
            </button>
            <h2 className="text-4xl md:text-7xl font-black mb-6 md:mb-8 text-white drop-shadow-xl text-center mt-12 md:mt-0" style={{ fontFamily: 'Outfit' }}>Scan to Ask</h2>
            <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-[0_16px_0_#1A1A1A] md:shadow-[0_32px_0_#1A1A1A] border-4 md:border-8 border-[#1A1A1A] transform rotate-1 max-w-[90vw] max-h-[60vh] flex items-center justify-center">
               <QRCodeSVG value={joinUrl} size={300} className="w-full max-w-[300px] md:max-w-[500px] h-auto aspect-square" level="H" />
            </div>
            <div className="mt-10 md:mt-16 text-center transform -rotate-2">
               <p className="text-3xl md:text-5xl font-mono font-black tracking-[0.2em] text-[#1A1A1A] bg-[#FFB800] px-8 py-4 md:px-12 md:py-6 rounded-full border-4 md:border-8 border-[#1A1A1A] shadow-[0_8px_0_#1A1A1A] md:shadow-[0_16px_0_#1A1A1A]">
                 {session.session_code}
               </p>
            </div>
         </div>
      )}
    </div>
  );
}

function FilterBtn({ label, active, onClick, count }: { label: string, active: boolean, onClick: () => void, count: number }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-sm md:text-lg font-black transition-all flex items-center gap-2 md:gap-3 ${active ? 'bg-[#46178f] text-white shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] border-2 border-[#1A1A1A] translate-y-1' : 'text-[#595959] hover:bg-[#EAE6F2] border-2 border-transparent'}`}
    >
      {label}
      <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg text-xs md:text-sm font-black ${active ? 'bg-white text-[#46178f]' : 'bg-white text-[#8C8C8C] shadow-inner'}`}>
        {count}
      </span>
    </button>
  );
}
