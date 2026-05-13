<template>
  <div class="dashboard-root">
    <!-- Top Navigation -->
    <nav class="top-nav">
      <div class="nav-inner">
        <div class="nav-left">
          <router-link to="/" class="nav-brand">
            <div class="nav-brand-icon">
              <span>A.</span>
            </div>
            <span class="nav-brand-text">Askly</span>
          </router-link>
        </div>
        <div class="nav-right">
          <div class="nav-user">
            <div class="user-avatar">
              {{ user?.name?.charAt(0)?.toUpperCase() || 'P' }}
            </div>
            <span class="user-name">{{ user?.name || 'Professor' }}</span>
          </div>
          <button @click="logout" class="nav-logout">
            <LogOut :size="18" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-left">
          <h1 class="page-title">Your Sessions</h1>
          <p class="page-subtitle">Manage live Q&A sessions for your lectures</p>
        </div>
        <button @click="showCreateModal = true" class="create-btn">
          <Plus :size="20" />
          <span>New Session</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading sessions...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="sessions.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <Presentation :size="40" />
        </div>
        <h3 class="empty-title">No sessions yet</h3>
        <p class="empty-desc">Create your first live session and share the code with your students.</p>
        <button @click="showCreateModal = true" class="empty-cta">
          <Plus :size="18" />
          <span>Create Your First Session</span>
        </button>
      </div>

      <!-- Session Grid -->
      <div v-else class="session-grid">
        <div
          v-for="(session, index) in sessions"
          :key="session.id"
          class="session-card"
          :style="{ animationDelay: `${index * 0.06}s` }"
        >
          <!-- Accent bar -->
          <div class="card-accent" :style="{ background: session.accent_color }"></div>

          <div class="card-body">
            <!-- Status badge -->
            <div class="card-top-row">
              <span v-if="session.is_active" class="status-badge status-live">
                <span class="live-dot"></span>
                Live
              </span>
              <span v-else class="status-badge status-closed">
                Closed
              </span>
              <button @click="deleteSession(session.id)" class="card-delete" title="Delete session">
                <Trash2 :size="15" />
              </button>
            </div>

            <!-- Title -->
            <h3 class="card-title">{{ session.title }}</h3>
            <p v-if="session.description" class="card-desc">{{ session.description }}</p>

            <!-- Join Code Box -->
            <div class="code-box">
              <div class="code-label">JOIN CODE</div>
              <div class="code-row">
                <span class="code-value">{{ session.session_code }}</span>
                <button @click="copyCode(session.session_code)" class="code-copy" :title="copied === session.session_code ? 'Copied!' : 'Copy code'">
                  <Check v-if="copied === session.session_code" :size="16" />
                  <Copy v-else :size="16" />
                </button>
              </div>
            </div>

            <!-- Action -->
            <router-link :to="`/dashboard/session/${session.id}`" class="card-action-btn">
              <span>Open Host View</span>
              <ArrowRight :size="18" />
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h2 class="modal-title">Create New Session</h2>
            <button @click="showCreateModal = false" class="modal-close">
              <X :size="20" />
            </button>
          </div>

          <form @submit.prevent="createSession" class="modal-body">
            <div class="field-group">
              <label class="field-label">Session Title</label>
              <input
                v-model="newSession.title"
                type="text"
                placeholder="e.g. Introduction to Thermodynamics"
                class="modal-input"
                required
              />
            </div>

            <div class="field-group">
              <label class="field-label">Description <span class="optional-tag">Optional</span></label>
              <textarea
                v-model="newSession.description"
                placeholder="Brief context for your students..."
                class="modal-textarea"
              ></textarea>
            </div>

            <div class="field-group">
              <label class="field-label">Topic Keywords <span class="optional-tag">Smart Filter</span></label>
              <p class="field-hint">Comma-separated keywords. Off-topic questions will be auto-flagged.</p>
              <input
                v-model="newSession.topic_keywords"
                type="text"
                placeholder="e.g. energy, heat, temperature, entropy"
                class="modal-input"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Theme Color</label>
              <div class="color-picker">
                <button
                  v-for="color in themeColors"
                  :key="color"
                  type="button"
                  @click="newSession.accent_color = color"
                  class="color-swatch"
                  :class="{ active: newSession.accent_color === color }"
                  :style="{ background: color }"
                >
                  <Check v-if="newSession.accent_color === color" :size="16" class="swatch-check" />
                </button>
              </div>
            </div>

            <button type="submit" :disabled="creating" class="modal-submit">
              <Zap :size="18" />
              <span>{{ creating ? 'Launching...' : 'Launch Session' }}</span>
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Presentation, Copy, Check, X, ArrowRight, Trash2, LogOut, Zap } from 'lucide-vue-next';
import api from '../api';

const router = useRouter();
const user = ref(null);
const sessions = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const creating = ref(false);
const copied = ref('');

const themeColors = ['#46178f', '#E21B3C', '#1368CE', '#26890C', '#D89E00', '#FF6B35'];

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
  copied.value = code;
  setTimeout(() => { copied.value = ''; }, 2000);
};

const logout = async () => {
  try { await api.post('/logout'); } catch (e) {}
  localStorage.removeItem('auth_token');
  router.push('/login');
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.dashboard-root {
  min-height: 100vh;
  background: #F0EDF5;
}

/* ═══ NAVIGATION ═══ */
.top-nav {
  background: white;
  border-bottom: 1px solid #E8E5F0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.nav-brand-icon {
  width: 36px;
  height: 36px;
  background: #46178f;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 14px;
}

.nav-brand-text {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1A1A2E;
  letter-spacing: -0.02em;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 6px;
  background: #F5F3FA;
  border-radius: 999px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #46178f, #7B42C9);
  color: white;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A2E;
}

.nav-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #6B6B80;
  transition: all 0.2s;
}

.nav-logout:hover {
  background: #FEF2F2;
  color: #E21B3C;
}

/* ═══ MAIN CONTENT ═══ */
.dashboard-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 32px 64px;
}

.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 36px;
}

.page-title {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1A1A2E;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: #6B6B80;
  font-weight: 500;
  margin-top: 4px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #46178f;
  color: white;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 0 #2E0E63;
  transition: all 0.15s ease;
  position: relative;
  top: 0;
}

.create-btn:hover {
  top: 2px;
  box-shadow: 0 2px 0 #2E0E63;
}

/* ═══ LOADING ═══ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: #6B6B80;
  font-weight: 600;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E8E5F0;
  border-top-color: #46178f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ═══ EMPTY STATE ═══ */
.empty-state {
  text-align: center;
  padding: 80px 32px;
  background: white;
  border-radius: 24px;
  border: 2px dashed #D4D0E0;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background: #F5F3FA;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #9E9EB0;
}

.empty-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 15px;
  color: #6B6B80;
  font-weight: 500;
  max-width: 380px;
  margin: 0 auto 28px;
}

.empty-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #46178f;
  color: white;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 0 #2E0E63;
  transition: all 0.15s;
  position: relative;
  top: 0;
}

.empty-cta:hover {
  top: 2px;
  box-shadow: 0 2px 0 #2E0E63;
}

/* ═══ SESSION GRID ═══ */
.session-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.session-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(26, 10, 46, 0.05);
  border: 1px solid #E8E5F0;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
}

.session-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(26, 10, 46, 0.1);
  border-color: transparent;
}

.card-accent {
  height: 5px;
  width: 100%;
}

.card-body {
  padding: 24px;
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-live {
  background: rgba(0, 200, 150, 0.1);
  color: #26890C;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #26890C;
  animation: pulse-glow 2s ease-in-out infinite;
}

.status-closed {
  background: #F5F3FA;
  color: #9E9EB0;
}

.card-delete {
  padding: 8px;
  border-radius: 8px;
  color: #9E9EB0;
  transition: all 0.2s;
  opacity: 0;
}

.session-card:hover .card-delete {
  opacity: 1;
}

.card-delete:hover {
  background: #FEF2F2;
  color: #E21B3C;
}

.card-title {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1.3;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: 13px;
  color: #6B6B80;
  font-weight: 500;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.code-box {
  background: #F5F3FA;
  border-radius: 14px;
  padding: 14px 18px;
  margin: 16px 0 20px;
  transition: background 0.2s;
}

.session-card:hover .code-box {
  background: #EFEAFC;
}

.code-label {
  font-size: 10px;
  font-weight: 800;
  color: #9E9EB0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 6px;
}

.code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.code-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 26px;
  font-weight: 700;
  color: #1A1A2E;
  letter-spacing: 0.2em;
}

.code-copy {
  padding: 8px;
  border-radius: 8px;
  color: #6B6B80;
  transition: all 0.2s;
}

.code-copy:hover {
  background: white;
  color: #46178f;
}

.card-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  background: #1A1A2E;
  color: white;
  border-radius: 12px;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.2s;
  text-decoration: none;
}

.card-action-btn:hover {
  background: #46178f;
  box-shadow: 0 4px 16px rgba(70, 23, 143, 0.25);
}

/* ═══ MODAL ═══ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 10, 46, 0.45);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeIn 0.2s ease;
}

.modal-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid #E8E5F0;
  background: #FAFAFE;
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #1A1A2E;
}

.modal-close {
  padding: 8px;
  border-radius: 10px;
  color: #9E9EB0;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #F5F3FA;
  color: #1A1A2E;
}

.modal-body {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
  display: flex;
  align-items: center;
  gap: 8px;
}

.optional-tag {
  font-size: 11px;
  font-weight: 600;
  color: #9E9EB0;
  background: #F5F3FA;
  padding: 2px 8px;
  border-radius: 6px;
}

.field-hint {
  font-size: 12px;
  color: #9E9EB0;
  font-weight: 500;
  margin-top: -4px;
}

.modal-input {
  width: 100%;
  height: 48px;
  background: #F5F3FA;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 500;
  color: #1A1A2E;
  outline: none;
  transition: all 0.2s;
}

.modal-input::placeholder { color: #B8B5C4; }

.modal-input:focus {
  background: white;
  border-color: #46178f;
  box-shadow: 0 0 0 4px rgba(70, 23, 143, 0.08);
}

.modal-textarea {
  width: 100%;
  height: 88px;
  background: #F5F3FA;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #1A1A2E;
  outline: none;
  resize: none;
  transition: all 0.2s;
}

.modal-textarea::placeholder { color: #B8B5C4; }

.modal-textarea:focus {
  background: white;
  border-color: #46178f;
  box-shadow: 0 0 0 4px rgba(70, 23, 143, 0.08);
}

.color-picker {
  display: flex;
  gap: 10px;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-swatch.active {
  border-color: #1A1A2E;
  transform: scale(1.1);
}

.color-swatch:hover:not(.active) {
  transform: scale(1.05);
}

.swatch-check {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
}

.modal-submit {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #46178f;
  color: white;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 700;
  box-shadow: 0 4px 0 #2E0E63;
  transition: all 0.15s;
  position: relative;
  top: 0;
  margin-top: 4px;
}

.modal-submit:hover:not(:disabled) {
  top: 2px;
  box-shadow: 0 2px 0 #2E0E63;
}

.modal-submit:disabled {
  opacity: 0.6;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(38, 137, 12, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(38, 137, 12, 0); }
}
</style>
