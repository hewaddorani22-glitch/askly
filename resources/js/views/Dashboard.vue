<template>
  <div class="min-h-screen bg-[#F4F3F7]">
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-[#46178f] rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm font-outfit">A.</span>
            </div>
            <span class="font-extrabold text-xl text-gray-900 tracking-tight font-outfit">Askly Dashboard</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm font-semibold text-gray-500 hidden sm:block">Prof. {{ user?.name }}</span>
            <button @click="logout" class="text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900 font-outfit">Your Sessions</h1>
        <button @click="showCreateModal = true" class="bg-[#46178f] hover:bg-[#3b127a] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-[0_4px_14px_0_rgba(70,23,143,0.39)] hover:shadow-[0_6px_20px_rgba(70,23,143,0.23)] hover:-translate-y-0.5 transition-all">
          <Plus class="w-5 h-5" />
          New Session
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#46178f] border-t-transparent"></div>
      </div>

      <div v-else-if="sessions.length === 0" class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
        <div class="w-20 h-20 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Presentation class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">No active sessions</h3>
        <p class="text-gray-500 font-medium mb-6">Create your first session to start receiving anonymous questions.</p>
        <button @click="showCreateModal = true" class="text-[#46178f] font-bold hover:underline">
          Create Session &rarr;
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="session in sessions" :key="session.id" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
          <div class="h-4 w-full" :style="{ backgroundColor: session.accent_color }"></div>
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <span v-if="session.is_active" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#00C896]/10 text-[#00C896] mb-3">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse"></span> Live
                </span>
                <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-500 mb-3">
                  Closed
                </span>
                <h3 class="text-xl font-bold text-gray-900 mb-1 leading-tight line-clamp-2">{{ session.title }}</h3>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-4 flex items-center justify-between mb-6 group-hover:bg-[#46178f]/5 transition-colors">
              <div>
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Join Code</p>
                <p class="text-2xl font-black text-gray-900 tracking-widest">{{ session.session_code }}</p>
              </div>
              <button @click="copyCode(session.session_code)" class="p-2 text-gray-400 hover:text-[#46178f] hover:bg-white rounded-lg transition-colors shadow-sm bg-white border border-gray-200">
                <Copy class="w-5 h-5" />
              </button>
            </div>

            <div class="flex gap-3">
              <router-link :to="`/dashboard/session/${session.id}`" class="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-center transition-colors">
                Open Host View
              </router-link>
              <button @click="deleteSession(session.id)" class="px-4 py-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 class="text-xl font-bold text-gray-900">Create New Session</h2>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <form @submit.prevent="createSession" class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Session Title</label>
            <input 
              v-model="newSession.title"
              type="text" 
              placeholder="e.g. Introduction to Thermodynamics"
              class="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 font-medium text-gray-800 focus:outline-none focus:border-[#46178f] focus:bg-white focus:ring-4 focus:ring-[#46178f]/10"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
            <textarea 
              v-model="newSession.description"
              placeholder="Brief description for students..."
              class="w-full h-24 bg-gray-50 border-2 border-gray-200 rounded-xl p-4 font-medium text-gray-800 focus:outline-none focus:border-[#46178f] focus:bg-white focus:ring-4 focus:ring-[#46178f]/10 resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Topic Keywords (Smart Filter)</label>
            <p class="text-xs text-gray-500 mb-2">Separate by comma. Questions not containing these words may be flagged as off-topic.</p>
            <input 
              v-model="newSession.topic_keywords"
              type="text" 
              placeholder="e.g. energy, heat, temperature, entropy"
              class="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 font-medium text-gray-800 focus:outline-none focus:border-[#46178f] focus:bg-white focus:ring-4 focus:ring-[#46178f]/10"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Theme Color</label>
            <div class="flex gap-3">
              <button v-for="color in ['#46178f', '#FF3366', '#00C896', '#FFB800', '#00A1F1']" :key="color"
                type="button"
                @click="newSession.accent_color = color"
                class="w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center"
                :class="newSession.accent_color === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'"
                :style="{ backgroundColor: color }"
              >
                <Check v-if="newSession.accent_color === color" class="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <button 
            type="submit"
            :disabled="creating"
            class="w-full h-14 mt-2 bg-[#46178f] hover:bg-[#3b127a] text-white rounded-xl font-bold text-lg shadow-md transition-all disabled:opacity-50"
          >
            {{ creating ? 'Creating...' : 'Launch Session' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Presentation, Copy, X, Check, ArrowRight } from 'lucide-vue-next';
import api from '../api';

const router = useRouter();
const user = ref(null);
const sessions = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const creating = ref(false);

const newSession = reactive({
  title: '',
  description: '',
  topic_keywords: '',
  accent_color: '#46178f'
});

const loadData = async () => {
  try {
    const [userRes, sessionsRes] = await Promise.all([
      api.get('/user'),
      api.get('/professor/sessions')
    ]);
    user.value = userRes.data;
    sessions.value = sessionsRes.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const createSession = async () => {
  creating.value = true;
  try {
    const { data } = await api.post('/professor/sessions', newSession);
    sessions.value.unshift(data);
    showCreateModal.value = false;
    newSession.title = '';
    newSession.description = '';
    newSession.topic_keywords = '';
    
    // Optionally redirect to it
    // router.push(`/dashboard/session/${data.id}`);
  } catch (err) {
    alert('Error creating session');
  } finally {
    creating.value = false;
  }
};

const deleteSession = async (id) => {
  if (confirm('Are you sure you want to delete this session?')) {
    try {
      await api.delete(`/professor/sessions/${id}`);
      sessions.value = sessions.value.filter(s => s.id !== id);
    } catch (err) {
      alert('Error deleting session');
    }
  }
};

const copyCode = (code) => {
  navigator.clipboard.writeText(code);
  // could add toast here
};

const logout = async () => {
  try {
    await api.post('/logout');
  } catch (e) {}
  localStorage.removeItem('auth_token');
  router.push('/login');
};

onMounted(() => {
  loadData();
});
</script>
