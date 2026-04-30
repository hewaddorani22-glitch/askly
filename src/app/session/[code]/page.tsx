'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getVoterId, textSimilarity, timeAgo } from '@/lib/utils';
import { Send, ThumbsUp, HelpCircle, CheckCircle2, Pin } from 'lucide-react';
import Link from 'next/link';
import Confetti from 'react-confetti';

export default function StudentSessionPage({ params }: { params: Promise<{ code: string }> }) {
  const unwrappedParams = use(params);
  const code = unwrappedParams.code;
  const router = useRouter();
  const supabase = createClient();
  
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voterId, setVoterId] = useState('');
  const [votedQuestionIds, setVotedQuestionIds] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setVoterId(getVoterId());
    
    async function loadSession() {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_code', code)
        .single();
        
      if (sessionError || !sessionData) {
        router.push('/join?error=not-found');
        return;
      }
      
      setSession(sessionData);

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('session_id', sessionData.id)
        .order('upvote_count', { ascending: false });
        
      if (questionsData) {
        setQuestions(questionsData);
      }

      const currentVoterId = getVoterId();
      if (currentVoterId) {
        const { data: votes } = await supabase
          .from('upvotes')
          .select('question_id')
          .eq('voter_id', currentVoterId);
          
        if (votes) {
          setVotedQuestionIds(new Set(votes.map(v => v.question_id)));
        }
      }

      setLoading(false);

      const channel = supabase.channel(`session_${sessionData.id}`)
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'questions',
            filter: `session_id=eq.${sessionData.id}`
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
  }, [code, supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || submitting || !session) return;
    
    setSubmitting(true);
    
    let isDuplicate = false;
    let duplicateOf = null;
    
    for (const q of questions) {
      if (textSimilarity(newQuestion, q.content) > 0.7) {
        isDuplicate = true;
        duplicateOf = q.id;
        break;
      }
    }
    
    const { data, error } = await supabase
      .from('questions')
      .insert({
        session_id: session.id,
        content: newQuestion.trim(),
        is_anonymous: true,
        is_duplicate: isDuplicate,
        duplicate_of: duplicateOf
      })
      .select()
      .single();
      
    if (!error && data) {
      handleUpvote(data.id);
      setNewQuestion('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else if (error) {
       alert(error.code === '42501' ? "Database Error: Cannot ask question because Row Level Security is enabled on the questions table." : error.message);
    }
    
    setSubmitting(false);
  };

  const handleUpvote = async (questionId: string) => {
    if (votedQuestionIds.has(questionId) || !voterId) return;
    
    setVotedQuestionIds(prev => new Set(prev).add(questionId));
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, upvote_count: q.upvote_count + 1 } : q
    ).sort((a, b) => {
      if (a.status === 'pinned' && b.status !== 'pinned') return -1;
      if (b.status === 'pinned' && a.status !== 'pinned') return 1;
      return b.upvote_count - a.upvote_count;
    }));
    
    const { error } = await supabase.from('upvotes').insert({
      question_id: questionId,
      voter_id: voterId
    });
    
    if (error && error.code === '42501') {
      alert("Database Error: Cannot upvote because Row Level Security is enabled on the upvotes table.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#46178f] text-white font-black text-2xl md:text-3xl">Loading Game...</div>;
  }

  if (!session?.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col text-center p-6 bg-[#46178f]">
        <div className="bg-white max-w-lg w-full p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border-4 border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A] md:shadow-[12px_12px_0_#1A1A1A]">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Game Over!</h2>
          <p className="text-lg md:text-xl text-[#595959] font-bold mb-8 md:mb-10">The professor has ended this Q&A session.</p>
          <button onClick={() => router.push('/')} className="btn bg-[#1A1A1A] text-white w-full py-4 md:py-6 text-xl md:text-2xl shadow-[0_4px_0_#000] md:shadow-[0_6px_0_#000] hover:-translate-y-1 hover:shadow-[0_6px_0_#000] md:hover:shadow-[0_8px_0_#000]">Return Home</button>
        </div>
      </div>
    );
  }

  const visibleQuestions = questions.filter(q => q.status !== 'dismissed');

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F3F7]">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} gravity={0.3} />}

      {/* Chunky Header */}
      <header className="sticky top-0 z-50 bg-[#46178f] border-b-4 border-[#1A1A1A] px-4 md:px-6 py-3 md:py-4 shadow-[0_4px_0_rgba(0,0,0,0.2)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="truncate mr-4">
            <h1 className="font-black text-xl md:text-2xl text-white tracking-tight truncate">{session.title}</h1>
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#FFB800] font-bold mt-0.5 md:mt-1">
              <span className="flex items-center gap-2"><span className="w-2 h-2 md:w-3 md:h-3 bg-[#FFB800] rounded-full animate-pulse border-2 border-[#1A1A1A]"></span> LIVE NOW</span>
            </div>
          </div>
          <Link href="/" className="bg-white text-[#1A1A1A] font-black px-3 py-1.5 md:px-4 md:py-2 rounded-full border-2 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] hover:translate-y-[2px] hover:shadow-[0_2px_0_#1A1A1A] transition-all text-sm md:text-base shrink-0">
            Leave
          </Link>
        </div>
      </header>

      {/* Massive Input Section */}
      <div className="sticky top-[68px] md:top-[86px] z-40 bg-[#F4F3F7] pt-4 pb-4 px-4 md:pt-6 md:pb-6 md:px-6 border-b-4 border-[#E0E0E0] shadow-sm">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-4 relative">
          <input
            type="text"
            placeholder="Type a question..."
            className="w-full pl-5 pr-14 py-4 md:pl-6 md:pr-20 md:py-6 text-lg md:text-xl font-bold bg-white border-4 border-[#1A1A1A] rounded-[1.5rem] md:rounded-[2rem] shadow-[0_4px_0_rgba(0,0,0,0.1)] md:shadow-[0_8px_0_rgba(0,0,0,0.1)] focus:shadow-[0_8px_0_rgba(0,0,0,0.1)] md:focus:shadow-[0_12px_0_rgba(0,0,0,0.1)] focus:border-[#46178f] transition-all outline-none"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            disabled={submitting}
          />
          <button 
            type="submit" 
            className="absolute right-2 top-2 bottom-2 md:right-3 md:top-3 md:bottom-3 aspect-square flex items-center justify-center rounded-[1.2rem] md:rounded-[1.5rem] bg-[#00C896] text-[#1A1A1A] hover:bg-[#00A078] border-2 md:border-4 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A] md:shadow-[0_4px_0_#1A1A1A] hover:translate-y-[2px] hover:shadow-[0_1px_0_#1A1A1A] md:hover:shadow-[0_2px_0_#1A1A1A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newQuestion.trim() || submitting}
          >
            <Send size={20} className="md:w-7 md:h-7" strokeWidth={3} />
          </button>
        </form>
      </div>

      {/* Questions Feed */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 md:gap-6 pb-24">
          {visibleQuestions.length === 0 ? (
            <div className="text-center py-16 md:py-24 flex flex-col items-center bg-white border-4 border-dashed border-[#CCCCCC] rounded-[2rem] md:rounded-[3rem] shadow-sm px-4">
              <HelpCircle size={48} className="md:w-16 md:h-16 mb-4 md:mb-6 text-[#EAE6F2]" strokeWidth={3} />
              <p className="font-black text-2xl md:text-3xl text-[#1A1A1A] mb-2">No questions yet!</p>
              <p className="text-lg md:text-xl font-bold text-[#595959]">Type something above to start.</p>
            </div>
          ) : (
            visibleQuestions.map((q) => (
              <div 
                key={q.id} 
                className={`flex gap-3 md:gap-6 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-4 border-[#1A1A1A] transition-all ${q.status === 'pinned' ? 'bg-white shadow-[6px_6px_0_#FF3366] md:shadow-[8px_8px_0_#FF3366] border-[#FF3366] md:scale-[1.02] z-10' : 'bg-white shadow-[4px_4px_0_#1A1A1A] md:shadow-[6px_6px_0_#1A1A1A]'} ${q.status === 'answered' ? 'opacity-50 bg-[#EAE6F2] shadow-none transform scale-95' : ''}`}
              >
                {/* Massive Bouncy Upvote Button (Smaller on mobile) */}
                <button 
                  onClick={() => handleUpvote(q.id)}
                  disabled={votedQuestionIds.has(q.id) || q.status === 'answered'}
                  className="flex flex-col items-center justify-center gap-1 md:gap-2 shrink-0 transition-all border-2 md:border-4 rounded-xl md:rounded-[1.5rem]"
                  style={{ 
                    width: '60px', height: '80px',
                    backgroundColor: votedQuestionIds.has(q.id) ? '#46178f' : '#FFFFFF',
                    color: votedQuestionIds.has(q.id) ? 'white' : '#1A1A1A',
                    borderColor: votedQuestionIds.has(q.id) ? '#1A1A1A' : '#1A1A1A',
                    boxShadow: votedQuestionIds.has(q.id) ? '0 0 0 transparent' : '0 4px 0 #1A1A1A',
                    transform: votedQuestionIds.has(q.id) ? 'translateY(4px)' : 'translateY(0)',
                    cursor: (votedQuestionIds.has(q.id) || q.status === 'answered') ? 'default' : 'pointer'
                  }}
                >
                  <ThumbsUp size={20} className="md:w-7 md:h-7" strokeWidth={3} />
                  <span className="font-black font-mono text-xl md:text-2xl leading-none">{q.upvote_count}</span>
                </button>

                {/* Question Content */}
                <div className="flex-1 flex flex-col justify-center py-1 md:py-2">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    {q.status === 'pinned' && <span className="bg-[#FF3366] text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-[#1A1A1A] shadow-[0_2px_0_#1A1A1A]">📌 Pinned</span>}
                    {q.status === 'answered' && <span className="bg-[#00C896] text-[#1A1A1A] px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-[#1A1A1A]">✓ Done</span>}
                    {q.is_duplicate && !q.duplicate_of && ( 
                      <span className="bg-[#FFB800] text-[#1A1A1A] px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border-2 border-[#1A1A1A]">🔥 Hot</span>
                    )}
                    <span className="text-xs md:text-sm text-[#8C8C8C] font-bold ml-auto">{timeAgo(q.created_at)}</span>
                  </div>
                  <p className="text-[#1A1A1A] text-lg md:text-2xl font-bold leading-tight md:leading-tight">{q.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
