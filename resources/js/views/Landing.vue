<template>
  <div class="min-h-screen bg-[#F4F3F7] flex flex-col items-center justify-center p-4 selection:bg-[#46178f] selection:text-white">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 sm:p-10 border border-gray-100 relative overflow-hidden text-center">
      
      <!-- Decorative Elements -->
      <div class="absolute -top-12 -right-12 w-32 h-32 bg-[#FF3366]/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-12 -left-12 w-32 h-32 bg-[#00C896]/10 rounded-full blur-2xl"></div>

      <div class="mb-10 relative z-10">
        <div class="w-20 h-20 bg-[#46178f] rounded-2xl mx-auto mb-6 flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300 shadow-[0_4px_14px_0_rgba(70,23,143,0.39)]">
          <MessageSquare class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-4xl font-extrabold text-[#1A1A1A] tracking-tight mb-3 font-outfit">
          Askly<span class="text-[#46178f]">.</span>
        </h1>
        <p class="text-gray-500 font-medium">Ask without raising your hand.</p>
      </div>

      <div class="space-y-4 relative z-10">
        <form @submit.prevent="joinSession">
          <div class="relative group mb-4">
            <input 
              v-model="sessionCode"
              type="text" 
              placeholder="Enter Session Code" 
              class="w-full h-14 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 font-bold text-center text-xl uppercase tracking-widest text-gray-800 focus:outline-none focus:border-[#46178f] focus:bg-white focus:ring-4 focus:ring-[#46178f]/10 transition-all placeholder:text-gray-400 placeholder:font-medium placeholder:tracking-normal placeholder:lowercase"
              maxlength="6"
            />
          </div>

          <button 
            type="submit"
            :disabled="sessionCode.length < 6"
            class="w-full h-14 bg-[#46178f] hover:bg-[#3b127a] text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(70,23,143,0.39)] hover:shadow-[0_6px_20px_rgba(70,23,143,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
          >
            Join Session
            <ArrowRight class="w-5 h-5" />
          </button>
        </form>

        <div class="relative py-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm font-semibold">
            <span class="px-3 bg-white text-gray-400 uppercase tracking-wider">or</span>
          </div>
        </div>

        <router-link 
          to="/login"
          class="w-full h-14 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
        >
          Professor Login
        </router-link>
      </div>
    </div>
    
    <div class="mt-8 text-sm font-medium text-gray-400">
      Built for interactive classrooms.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessageSquare, ArrowRight } from 'lucide-vue-next';

const router = useRouter();
const sessionCode = ref('');

const joinSession = () => {
  if (sessionCode.value.length === 6) {
    router.push(`/session/${sessionCode.value.toUpperCase()}`);
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800;900&display=swap');
.font-outfit { font-family: 'Outfit', sans-serif; }
</style>
