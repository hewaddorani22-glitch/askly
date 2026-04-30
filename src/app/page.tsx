import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageCircleQuestion, Filter, ShieldCheck, Sparkles, Zap, Hand } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-[#F4F3F7]">
      {/* Playful Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b-[3px] border-[#E0E0E0]">
        <div className="container px-4 md:px-8 mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#46178f] rounded-xl flex items-center justify-center shadow-[0_4px_0_#321066] transform -rotate-3 hover:rotate-0 transition-transform">
              <Image src="/askly-logo.png" alt="Askly Logo" width={20} height={20} className="brightness-0 invert md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'Outfit, sans-serif' }}>Askly</span>
          </div>
          <div className="flex gap-2 md:gap-4 items-center">
            <Link href="/login" className="text-sm md:text-base font-bold text-[#595959] hover:text-[#46178f] transition-colors px-2 md:px-4 py-2">Log In</Link>
            <Link href="/join" className="btn bg-white text-[#46178f] border-[3px] border-[#46178f] shadow-[0_4px_0_#46178f] hover:translate-y-[2px] hover:shadow-[0_2px_0_#46178f] py-1.5 px-4 md:py-2 md:px-6 text-sm md:text-base rounded-full font-bold">
              Join
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-col pt-24 md:pt-32 pb-24 relative">
        {/* Floating Background Shapes (Kahoot Style) - Hidden on mobile */}
        <div className="hidden md:block absolute top-20 left-[10%] w-32 h-32 bg-[#FF3366] rounded-full opacity-20 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="hidden md:block absolute top-40 right-[15%] w-40 h-40 bg-[#00C896] rounded-[2rem] rotate-12 opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="hidden md:block absolute bottom-40 left-[20%] w-24 h-24 bg-[#FFB800] rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Hero Section */}
        <section className="container px-4 md:px-8 mx-auto flex flex-col items-center justify-center text-center pb-20 md:pb-32 pt-12 md:pt-20 gap-6 md:gap-8 relative z-10">
          <div className="bg-[#46178f] text-white px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm tracking-widest uppercase shadow-[0_4px_0_#321066] mb-2 md:mb-4 flex items-center gap-2 transform -rotate-2">
            <Sparkles size={16} /> Let's make learning fun
          </div>
          <h1 className="text-5xl md:text-[5rem] font-black leading-[1.1] max-w-4xl text-[#1A1A1A]" style={{ fontFamily: 'Outfit' }}>
            Ask without raising <br/>
            <span className="text-[#46178f] relative inline-block">
              your hand.
              <svg className="absolute w-full h-2 md:h-4 -bottom-1 left-0 text-[#FF3366]" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00016 6.84039C56.1268 2.05928 141.488 -1.2462 198.053 6.84039" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
            </span>
          </h1>
          <p className="text-[#595959] text-lg md:text-xl max-w-2xl font-medium leading-relaxed mt-2 md:mt-4">
            The fun, anonymous Q&A platform for classrooms. Students ask freely, you answer the best ones. Zero stress, 100% engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-8 md:mt-10 w-full sm:w-auto">
            <Link href="/signup" className="btn bg-[#46178f] text-white border-2 border-transparent shadow-[0_6px_0_#321066] hover:translate-y-[2px] hover:shadow-[0_4px_0_#321066] px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl rounded-full w-full sm:w-auto justify-center">
              Host a Session
            </Link>
            <Link href="/join" className="btn bg-white text-[#1A1A1A] border-4 border-[#1A1A1A] shadow-[0_6px_0_#1A1A1A] hover:translate-y-[2px] hover:shadow-[0_4px_0_#1A1A1A] px-8 py-4 md:px-10 md:py-5 text-lg md:text-xl rounded-full w-full sm:w-auto justify-center">
              Enter Code
              <ArrowRight size={20} className="ml-2 hidden sm:inline" />
            </Link>
          </div>
        </section>

        {/* Playful Feature Grid */}
        <section className="container px-4 md:px-8 mx-auto py-16 md:py-32 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border-4 border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[12px_12px_0_#1A1A1A] transition-all duration-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FF3366] rounded-[1.5rem] flex items-center justify-center mb-6 md:mb-8 border-4 border-[#1A1A1A] shadow-[0_4px_0_#1A1A1A] transform -rotate-6">
                <ShieldCheck size={28} color="white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">100% Anonymous</h3>
              <p className="text-[#595959] text-base md:text-lg font-medium leading-relaxed">No accounts needed for students. Break the ice and get the questions they were too shy to ask aloud.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border-4 border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[12px_12px_0_#1A1A1A] transition-all duration-300 md:-translate-y-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FFB800] rounded-[1.5rem] flex items-center justify-center mb-6 md:mb-8 border-4 border-[#1A1A1A] shadow-[0_4px_0_#1A1A1A] transform rotate-3">
                <Zap size={28} color="black" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">Live Upvoting</h3>
              <p className="text-[#595959] text-base md:text-lg font-medium leading-relaxed">Students vote on the questions they want answered most. The best questions automatically pop to the top!</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border-4 border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[12px_12px_0_#1A1A1A] transition-all duration-300">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#00C896] rounded-[1.5rem] flex items-center justify-center mb-6 md:mb-8 border-4 border-[#1A1A1A] shadow-[0_4px_0_#1A1A1A] transform -rotate-3">
                <Filter size={28} color="white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">No Duplicates</h3>
              <p className="text-[#595959] text-base md:text-lg font-medium leading-relaxed">Smart filtering catches identical questions before they hit the screen, keeping your dashboard clean.</p>
            </div>
          </div>
        </section>

        {/* Big CTA */}
        <section className="container px-4 md:px-8 mx-auto mt-10 mb-20">
          <div className="bg-[#FFB800] rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden border-4 border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A] md:shadow-[12px_12px_0_#1A1A1A]">
            <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8">
              <h2 className="text-4xl md:text-[4rem] font-black text-[#1A1A1A] leading-tight" style={{ fontFamily: 'Outfit' }}>Ready to engage your class?</h2>
              <Link href="/signup" className="btn bg-[#1A1A1A] text-white border-2 border-transparent shadow-[0_6px_0_#000] hover:translate-y-[2px] hover:shadow-[0_4px_0_#000] px-8 py-4 md:px-12 md:py-6 text-xl md:text-2xl rounded-full w-full sm:w-auto">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
