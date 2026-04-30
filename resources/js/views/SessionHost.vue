<template>
  <div v-if="!session" class="min-h-screen bg-[#F4F3F7] flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#46178f] border-t-transparent"></div>
  </div>

  <div v-else class="min-h-screen bg-[#F4F3F7] flex flex-col font-sans">
    <nav class="bg-white border-b-4 border-gray-200 sticky top-0 z-50" :style="{ borderBottomColor: session.accent_color }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-4">
            <router-link to="/dashboard" class="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft class="w-6 h-6" />
            </router-link>
            <h1 class="font-bold text-xl text-gray-900 line-clamp-1">{{ session.title }}</h1>
          </div>
          <div class="flex items-center gap-6">
            <div class="hidden sm:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl">
              <span class="text-sm font-bold text-gray-500 uppercase tracking-wider">Join Code</span>
              <span class="text-xl font-black text-gray-900 tracking-widest">{{ session.session_code }}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:px-8 flex gap-6">
      
      <!-- Main Question Feed -->
      <div class="flex-1 space-y-4">
        <!-- Live Tabs -->
        <div class="flex gap-2 mb-6">
          <button @click="currentTab = 'active'" 
                  class="px-5 py-2.5 rounded-full font-bold text-sm transition-all"
                  :class="currentTab === 'active' ? 'bg-[#46178f] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'">
            Live Questions ({{ activeQuestions.length }})
          </button>
          <button @click="currentTab = 'filtered'" 
                  class="px-5 py-2.5 rounded-full font-bold text-sm transition-all"
                  :class="currentTab === 'filtered' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'">
            Filtered / Spam ({{ filteredQuestions.length }})
          </button>
          <button @click="currentTab = 'dismissed'" 
                  class="px-5 py-2.5 rounded-full font-bold text-sm transition-all"
                  :class="currentTab === 'dismissed' ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'">
            Answered / Dismissed ({{ dismissedQuestions.length }})
          </button>
        </div>

        <div v-if="displayedQuestions.length === 0" class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center mt-8">
          <MessageSquare class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-gray-900">No questions in this view</h3>
        </div>

        <!-- Question Cards -->
        <div v-for="q in displayedQuestions" :key="q.id" 
             class="bg-white rounded-2xl p-6 shadow-sm border-2 transition-all relative"
             :class="{
               'border-amber-400 ring-4 ring-amber-400/10': q.status === 'pinned', 
               'border-transparent hover:border-gray-200': q.status !== 'pinned'
             }">
             
          <div class="flex gap-5">
            <!-- Upvotes -->
            <div class="flex flex-col items-center min-w-[64px] h-20 rounded-xl bg-gray-50 border-2 border-gray-100 justify-center">
              <span class="font-black text-2xl text-gray-900 leading-none">{{ q.upvote_count }}</span>
              <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Votes</span>
            </div>

            <div class="flex-1">
              <!-- Meta/Tags -->
              <div class="flex items-center gap-2 mb-2">
                <span v-if="q.status === 'filtered'" class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded uppercase tracking-wider">
                  {{ q.filter_reason?.replace('_', ' ') }}
                </span>
                <span v-if="q.is_duplicate" class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase tracking-wider">
                  Duplicate
                </span>
              </div>
              
              <p class="text-xl font-bold text-gray-900 leading-snug mb-4">{{ q.content }}</p>
              
              <!-- Professor Controls -->
              <div class="flex gap-2">
                <template v-if="currentTab === 'active'">
                  <button @click="updateStatus(q.id, q.status === 'pinned' ? 'active' : 'pinned')" 
                          class="px-4 py-2 rounded-xl font-bold text-sm transition-colors border"
                          :class="q.status === 'pinned' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'">
                    <Pin class="w-4 h-4 inline mr-1" /> {{ q.status === 'pinned' ? 'Unpin' : 'Pin to Top' }}
                  </button>
                  <button @click="updateStatus(q.id, 'answered')" class="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 rounded-xl font-bold text-sm transition-colors">
                    <Check class="w-4 h-4 inline mr-1" /> Mark Answered
                  </button>
                  <button @click="updateStatus(q.id, 'dismissed')" class="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-xl font-bold text-sm transition-colors">
                    <Trash2 class="w-4 h-4 inline mr-1" /> Dismiss
                  </button>
                </template>

                <template v-else-if="currentTab === 'filtered'">
                   <button @click="updateStatus(q.id, 'active')" class="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 rounded-xl font-bold text-sm transition-colors">
                    <Check class="w-4 h-4 inline mr-1" /> Approve Question
                  </button>
                  <button @click="updateStatus(q.id, 'dismissed')" class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 rounded-xl font-bold text-sm transition-colors">
                    <Trash2 class="w-4 h-4 inline mr-1" /> Delete Permanently
                  </button>
                </template>

                <template v-else>
                   <button @click="updateStatus(q.id, 'active')" class="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-xl font-bold text-sm transition-colors">
                    <RotateCcw class="w-4 h-4 inline mr-1" /> Restore to Live
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, MessageSquare, Pin, Check, Trash2, RotateCcw } from 'lucide-vue-next';
import api from '../api';

const route = useRoute();
const sessionId = route.params.id;
const session = ref(null);
const allQuestions = ref([]);
const currentTab = ref('active');

let pollInterval = null;

const loadData = async () => {
  try {
    if (!session.value) {
      const { data } = await api.get(`/sessions/${sessionId}`);
      session.value = data;
    }
    const { data: qData } = await api.get(`/sessions/${session.value.id}/questions`);
    allQuestions.value = qData;
  } catch (err) {
    console.error(err);
  }
};

const activeQuestions = computed(() => allQuestions.value.filter(q => q.status === 'active' || q.status === 'pinned'));
const filteredQuestions = computed(() => allQuestions.value.filter(q => q.status === 'filtered'));
const dismissedQuestions = computed(() => allQuestions.value.filter(q => q.status === 'dismissed' || q.status === 'answered'));

const displayedQuestions = computed(() => {
  if (currentTab.value === 'active') return activeQuestions.value;
  if (currentTab.value === 'filtered') return filteredQuestions.value;
  return dismissedQuestions.value;
});

const updateStatus = async (questionId, status) => {
  try {
    // Optimistic update
    const qIndex = allQuestions.value.findIndex(q => q.id === questionId);
    if (qIndex > -1) {
      allQuestions.value[qIndex].status = status;
    }
    
    await api.patch(`/questions/${questionId}/status`, { status });
    // Reload to ensure order and consistency
    loadData();
  } catch (err) {
    alert('Failed to update status');
    loadData(); // revert
  }
};

onMounted(() => {
  loadData();
  // Live polling for Professor dashboard
  pollInterval = setInterval(loadData, 3000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
