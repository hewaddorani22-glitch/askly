<template>
  <div class="min-h-screen bg-[#F4F3F7] flex flex-col items-center justify-center p-4 selection:bg-[#46178f] selection:text-white">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 sm:p-10 border border-gray-100 relative overflow-hidden">
      
      <div class="mb-10 text-center">
        <div class="w-16 h-16 bg-[#46178f] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_4px_14px_0_rgba(70,23,143,0.39)]">
          <BookOpen class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold text-[#1A1A1A] tracking-tight mb-2 font-outfit">Professor Portal</h1>
        <p class="text-gray-500 font-medium">Log in to manage your sessions.</p>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <div v-if="error" class="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {{ error }}
        </div>

        <div v-if="!isLogin">
          <label class="block text-sm font-bold text-gray-700 mb-2">Name</label>
          <input 
            v-model="form.name"
            type="text" 
            class="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 font-medium text-gray-800 focus:outline-none focus:border-[#46178f] focus:bg-white focus:ring-4 focus:ring-[#46178f]/10 transition-all"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">University Email</label>
          <input 
            v-model="form.email"
            type="email" 
            class="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 font-medium text-gray-800 focus:outline-none focus:border-[#46178f] focus:bg-white focus:ring-4 focus:ring-[#46178f]/10 transition-all"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">Password</label>
          <input 
            v-model="form.password"
            type="password" 
            class="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 font-medium text-gray-800 focus:outline-none focus:border-[#46178f] focus:bg-white focus:ring-4 focus:ring-[#46178f]/10 transition-all"
            required
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full h-14 mt-4 bg-[#46178f] hover:bg-[#3b127a] text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(70,23,143,0.39)] hover:shadow-[0_6px_20px_rgba(70,23,143,0.23)] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center"
        >
          {{ loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account') }}
        </button>
      </form>

      <div class="mt-8 text-center">
        <button @click="isLogin = !isLogin" class="text-sm font-bold text-[#46178f] hover:underline">
          {{ isLogin ? "Don't have an account? Register" : "Already have an account? Sign in" }}
        </button>
      </div>
    </div>
    
    <router-link to="/" class="mt-6 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-2">
      <ArrowLeft class="w-4 h-4" /> Back to home
    </router-link>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, ArrowLeft } from 'lucide-vue-next';
import api from '../api';

const router = useRouter();
const isLogin = ref(true);
const loading = ref(false);
const error = ref('');

const form = reactive({
  name: '',
  email: '',
  password: ''
});

const handleAuth = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const endpoint = isLogin.value ? '/login' : '/register';
    const { data } = await api.post(endpoint, form);
    
    localStorage.setItem('auth_token', data.token);
    router.push('/dashboard');
  } catch (err) {
    if (err.response?.data?.errors) {
      error.value = Object.values(err.response.data.errors)[0][0];
    } else {
      error.value = err.response?.data?.message || 'Authentication failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
