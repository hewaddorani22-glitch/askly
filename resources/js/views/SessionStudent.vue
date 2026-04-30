<template>
  <div v-if="!session" class="min-h-screen bg-[#F4F3F7] flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#46178f] border-t-transparent"></div>
  </div>

  <div v-else class="min-h-screen bg-[#F4F3F7] flex flex-col font-sans">
    <!-- Header -->
    <header class="bg-white border-b-4 border-gray-200 sticky top-0 z-40" :style="{ borderBottomColor: session.accent_color }">
      <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: session.accent_color }">
            <span class="text-white font-bold text-lg font-outfit">A.</span>
          </div>
          <div>
            <h1 class="font-bold text-gray-900 leading-tight line-clamp-1">{{ session.title }}</h1>
            <p class="text-xs font-semibold text-gray-500">Askly Live Session</p>
          </div>
        </div>
        <div class="bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="session.is_active ? 'bg-[#00C896] animate-pulse' : 'bg-red-500'"></div>
          <span class="text-sm font-bold text-gray-700">{{ session.is_active ? 'Live' : 'Closed' }}</span>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-32">
      <!-- Info banner -->
      <div v-if="session.description" class="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 flex gap-3 items-start">
        <Info class="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
        <p class="text-sm font-medium text-gray-600">{{ session.description }}</p>
      </div>

      <!-- Question List -->
      <div class="space-y-4">
        <div v-if="questions.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <MessageSquare class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-1">No questions yet</h3>
          <p class="text-gray-500 font-medium">Be the first to ask something!</p>
        </div>

        <div v-for="q in questions" :key="q.id" 
             class="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] border-2 transition-all relative overflow-hidden"
             :class="{'border-amber-400': q.status === 'pinned', 'border-transparent hover:border-gray-200': q.status !== 'pinned'}">
             
          <div v-if="q.status === 'pinned'" class="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
            <Pin class="w-3 h-3" /> Pinned
          </div>
             
          <div class="flex gap-4">
            <!-- Upvote Button -->
            <button 
              @click="toggleUpvote(q)"
              class="flex flex-col items-center justify-center min-w-[56px] h-16 rounded-xl border-2 transition-all"
              :class="upvotedQuestions.has(q.id) ? 'bg-[#FF3366]/10 border-[#FF3366] text-[#FF3366]' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100'"
            >
              <ChevronUp class="w-6 h-6" :class="upvotedQuestions.has(q.id) ? 'animate-bounce' : ''" />
              <span class="font-black text-lg leading-none">{{ q.upvote_count }}</span>
            </button>

            <!-- Content -->
            <div class="flex-1 pt-1">
              <p class="text-lg font-bold text-gray-900 leading-snug">{{ q.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Ask Bar -->
    <div v-if="session.is_active" class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 p-4 pb-safe">
      <div class="max-w-4xl mx-auto">
        <form @submit.prevent="submitQuestion" class="flex gap-2">
          <input 
            v-model="newQuestion"
            type="text" 
            placeholder="Ask an anonymous question..." 
            class="flex-1 h-14 bg-gray-100 border-2 border-transparent rounded-2xl px-5 font-medium text-gray-800 focus:outline-none focus:border-[#46178f] focus:bg-white transition-all text-lg"
            maxlength="250"
            required
            :disabled="submitting"
          />
          <button 
            type="submit"
            :disabled="!newQuestion.trim() || submitting"
            class="h-14 px-6 bg-[#46178f] hover:bg-[#3b127a] text-white rounded-2xl font-bold text-lg shadow-md transition-all disabled:opacity-50 flex items-center justify-center"
          >
            <Send class="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { MessageSquare, ChevronUp, Send, Pin, Info } from 'lucide-vue-next';
import api from '../api';

const route = useRoute();
const sessionCode = route.params.id;
const session = ref(null);
const questions = ref([]);
const newQuestion = ref('');
const submitting = ref(false);

// We'll use a random UUID or local storage ID for the student voter
const getVoterId = () => {
  let id = localStorage.getItem('voter_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('voter_id', id);
  }
  return id;
};

const voterId = getVoterId();
const upvotedQuestions = ref(new Set()); // In a real app we'd fetch this or persist it
let pollInterval = null;

const loadData = async () => {
  try {
    if (!session.value) {
      const { data } = await api.get(`/sessions/${sessionCode}`);
      session.value = data;
    }
    
    const { data: qData } = await api.get(`/sessions/${session.value.id}/questions`);
    questions.value = qData;
    
    // Attempt to restore upvotes from local storage (simple impl)
    const stored = JSON.parse(localStorage.getItem(`upvotes_${session.value.id}`) || '[]');
    upvotedQuestions.value = new Set(stored);
  } catch (err) {
    console.error(err);
    if(err.response?.status === 404) {
       alert("Session not found");
    }
  }
};

const submitQuestion = async () => {
  if (!newQuestion.value.trim()) return;
  
  submitting.value = true;
  try {
    const { data } = await api.post(`/sessions/${session.value.id}/questions`, {
      content: newQuestion.value,
      is_anonymous: true
    });
    
    // If it was marked as duplicate or filtered, it might not show up normally.
    // The server returns the created question.
    if (data.status === 'filtered') {
       alert('Your question was filtered and will be reviewed by the professor.');
    } else if (data.is_duplicate) {
       alert('This question is very similar to an existing one. It has been grouped.');
    }
    
    newQuestion.value = '';
    loadData();
  } catch (err) {
    alert('Failed to submit question');
  } finally {
    submitting.value = false;
  }
};

const toggleUpvote = async (q) => {
  // Optimistic update
  const isUpvoted = upvotedQuestions.value.has(q.id);
  
  if (isUpvoted) {
    upvotedQuestions.value.delete(q.id);
    q.upvote_count--;
  } else {
    upvotedQuestions.value.add(q.id);
    q.upvote_count++;
  }
  
  // Persist locally
  localStorage.setItem(`upvotes_${session.value.id}`, JSON.stringify([...upvotedQuestions.value]));

  try {
    await api.post(`/questions/${q.id}/upvote`, { voter_id: voterId });
  } catch (err) {
    // Revert on error
    if (isUpvoted) {
      upvotedQuestions.value.add(q.id);
      q.upvote_count++;
    } else {
      upvotedQuestions.value.delete(q.id);
      q.upvote_count--;
    }
  }
};

onMounted(() => {
  loadData();
  // Poll every 3 seconds
  pollInterval = setInterval(loadData, 3000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
