<template>
  <!-- Loading -->
  <div v-if="!session" class="host-loading">
    <div class="spinner"></div>
  </div>

  <div v-else class="host-root">
    <!-- Top Bar -->
    <nav class="host-nav" :style="{ borderBottomColor: session.accent_color }">
      <div class="host-nav-inner">
        <div class="host-nav-left">
          <router-link to="/dashboard" class="back-btn">
            <ArrowLeft :size="20" />
          </router-link>
          <div class="session-info">
            <h1 class="session-title">{{ session.title }}</h1>
            <span v-if="session.is_active" class="live-indicator">
              <span class="live-dot"></span>
              Live
            </span>
          </div>
        </div>
        <div class="host-nav-right">
          <div class="join-code-badge">
            <span class="jcb-label">JOIN CODE</span>
            <span class="jcb-value">{{ session.session_code }}</span>
          </div>
          <div class="question-counter">
            <MessageSquare :size="16" />
            <span>{{ allQuestions.length }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="host-main">
      <!-- Sidebar Tabs -->
      <aside class="host-sidebar">
        <button
          @click="currentTab = 'active'"
          class="sidebar-tab"
          :class="{ active: currentTab === 'active' }"
        >
          <div class="tab-icon" style="background: #46178f;">
            <MessageSquare :size="16" />
          </div>
          <div class="tab-info">
            <span class="tab-label">Live Questions</span>
            <span class="tab-count">{{ activeQuestions.length }}</span>
          </div>
        </button>

        <button
          @click="currentTab = 'filtered'"
          class="sidebar-tab"
          :class="{ active: currentTab === 'filtered' }"
        >
          <div class="tab-icon" style="background: #D89E00;">
            <AlertTriangle :size="16" />
          </div>
          <div class="tab-info">
            <span class="tab-label">Filtered</span>
            <span class="tab-count">{{ filteredQuestions.length }}</span>
          </div>
        </button>

        <button
          @click="currentTab = 'dismissed'"
          class="sidebar-tab"
          :class="{ active: currentTab === 'dismissed' }"
        >
          <div class="tab-icon" style="background: #6B6B80;">
            <Archive :size="16" />
          </div>
          <div class="tab-info">
            <span class="tab-label">Archived</span>
            <span class="tab-count">{{ dismissedQuestions.length }}</span>
          </div>
        </button>
      </aside>

      <!-- Question Feed -->
      <div class="question-feed">
        <!-- Empty State -->
        <div v-if="displayedQuestions.length === 0" class="feed-empty">
          <div class="feed-empty-icon">
            <MessageSquare :size="32" />
          </div>
          <h3>{{ currentTab === 'active' ? 'Waiting for questions...' : 'Nothing here' }}</h3>
          <p v-if="currentTab === 'active'">Share the join code <strong>{{ session.session_code }}</strong> with your students</p>
        </div>

        <!-- Question Cards -->
        <div
          v-for="(q, index) in displayedQuestions"
          :key="q.id"
          class="question-card"
          :class="{
            'is-pinned': q.status === 'pinned',
            'is-filtered': q.status === 'filtered'
          }"
          :style="{ animationDelay: `${index * 0.04}s` }"
        >
          <!-- Vote Column -->
          <div class="vote-col">
            <span class="vote-count">{{ q.upvotes_count ?? q.upvote_count }}</span>
            <span class="vote-label">votes</span>
          </div>

          <!-- Content -->
          <div class="question-content">
            <!-- Tags -->
            <div v-if="q.status === 'filtered' || q.is_duplicate" class="question-tags">
              <span v-if="q.status === 'filtered'" class="qtag qtag-red">
                {{ q.filter_reason?.replace('_', ' ') || 'Filtered' }}
              </span>
              <span v-if="q.is_duplicate" class="qtag qtag-purple">
                Duplicate
              </span>
            </div>

            <p class="question-text">{{ q.content }}</p>

            <!-- Actions -->
            <div class="question-actions">
              <template v-if="currentTab === 'active'">
                <button
                  @click="updateStatus(q.id, q.status === 'pinned' ? 'active' : 'pinned')"
                  class="q-action"
                  :class="{ 'q-action-active': q.status === 'pinned' }"
                >
                  <Pin :size="14" />
                  <span>{{ q.status === 'pinned' ? 'Unpin' : 'Pin' }}</span>
                </button>
                <button @click="updateStatus(q.id, 'answered')" class="q-action q-action-green">
                  <Check :size="14" />
                  <span>Answered</span>
                </button>
                <button @click="updateStatus(q.id, 'dismissed')" class="q-action q-action-muted">
                  <X :size="14" />
                  <span>Dismiss</span>
                </button>
              </template>

              <template v-else-if="currentTab === 'filtered'">
                <button @click="updateStatus(q.id, 'active')" class="q-action q-action-green">
                  <Check :size="14" />
                  <span>Approve</span>
                </button>
                <button @click="updateStatus(q.id, 'dismissed')" class="q-action q-action-red">
                  <Trash2 :size="14" />
                  <span>Delete</span>
                </button>
              </template>

              <template v-else>
                <button @click="updateStatus(q.id, 'active')" class="q-action">
                  <RotateCcw :size="14" />
                  <span>Restore</span>
                </button>
              </template>
            </div>
          </div>

          <!-- Pinned indicator -->
          <div v-if="q.status === 'pinned'" class="pinned-badge">
            <Pin :size="12" />
            Pinned
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, MessageSquare, Pin, Check, X, Trash2, RotateCcw, AlertTriangle, Archive } from 'lucide-vue-next';
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
    const qIndex = allQuestions.value.findIndex(q => q.id === questionId);
    if (qIndex > -1) allQuestions.value[qIndex].status = status;
    await api.patch(`/questions/${questionId}/status`, { status });
    loadData();
  } catch (err) {
    alert('Failed to update status');
    loadData();
  }
};

onMounted(() => {
  loadData();
  pollInterval = setInterval(loadData, 3000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<style scoped>
.host-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F0EDF5;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E8E5F0;
  border-top-color: #46178f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.host-root {
  min-height: 100vh;
  background: #F0EDF5;
  display: flex;
  flex-direction: column;
}

/* ═══ NAV ═══ */
.host-nav {
  background: white;
  border-bottom: 4px solid #46178f;
  position: sticky;
  top: 0;
  z-index: 100;
}

.host-nav-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 28px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.host-nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  padding: 8px;
  border-radius: 10px;
  color: #6B6B80;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #F5F3FA;
  color: #1A1A2E;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-title {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1A1A2E;
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(38, 137, 12, 0.08);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #26890C;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #26890C;
  animation: pulse-glow 2s ease infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(38, 137, 12, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(38, 137, 12, 0); }
}

.host-nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.join-code-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: #F5F3FA;
  border-radius: 12px;
}

.jcb-label {
  font-size: 10px;
  font-weight: 800;
  color: #9E9EB0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.jcb-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #1A1A2E;
  letter-spacing: 0.15em;
}

.question-counter {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #F5F3FA;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #6B6B80;
}

/* ═══ MAIN LAYOUT ═══ */
.host-main {
  flex: 1;
  display: flex;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 28px;
  gap: 24px;
}

/* ═══ SIDEBAR ═══ */
.host-sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 88px;
  align-self: flex-start;
}

.sidebar-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  border: 2px solid transparent;
  border-radius: 14px;
  transition: all 0.2s;
  text-align: left;
}

.sidebar-tab:hover {
  border-color: #E8E5F0;
}

.sidebar-tab.active {
  border-color: #46178f;
  background: white;
  box-shadow: 0 4px 16px rgba(70, 23, 143, 0.08);
}

.tab-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.tab-info {
  display: flex;
  flex-direction: column;
}

.tab-label {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
}

.tab-count {
  font-size: 12px;
  font-weight: 700;
  color: #9E9EB0;
}

/* ═══ QUESTION FEED ═══ */
.question-feed {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-empty {
  text-align: center;
  padding: 80px 32px;
  background: white;
  border-radius: 20px;
  border: 2px dashed #D4D0E0;
}

.feed-empty-icon {
  width: 64px;
  height: 64px;
  background: #F5F3FA;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #9E9EB0;
}

.feed-empty h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.feed-empty p {
  font-size: 14px;
  color: #6B6B80;
  font-weight: 500;
}

.feed-empty strong {
  font-family: 'JetBrains Mono', monospace;
  color: #46178f;
  letter-spacing: 0.1em;
}

/* ═══ QUESTION CARDS ═══ */
.question-card {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  gap: 20px;
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}

.question-card:hover {
  border-color: #E8E5F0;
  box-shadow: 0 4px 16px rgba(26, 10, 46, 0.06);
}

.question-card.is-pinned {
  border-color: #D89E00;
  background: #FFFDF5;
}

.question-card.is-filtered {
  border-color: #FECACA;
  background: #FFFBFB;
}

.vote-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 56px;
  background: #F5F3FA;
  border-radius: 14px;
  flex-shrink: 0;
}

.vote-count {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1A1A2E;
  line-height: 1;
}

.vote-label {
  font-size: 10px;
  font-weight: 700;
  color: #9E9EB0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.question-content {
  flex: 1;
  min-width: 0;
}

.question-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.qtag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.qtag-red { background: #FEF2F2; color: #E21B3C; }
.qtag-purple { background: #F5F0FF; color: #7B42C9; }

.question-text {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
  line-height: 1.5;
  margin-bottom: 12px;
}

.question-actions {
  display: flex;
  gap: 8px;
}

.q-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6B6B80;
  background: #F5F3FA;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.q-action:hover { border-color: #D4D0E0; color: #1A1A2E; }
.q-action-active { background: #FFF8E1; color: #D89E00; border-color: #D89E00; }
.q-action-green:hover { background: #F0FFF4; color: #26890C; border-color: #26890C; }
.q-action-red:hover { background: #FEF2F2; color: #E21B3C; border-color: #E21B3C; }
.q-action-muted:hover { background: #F5F3FA; }

.pinned-badge {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 14px;
  background: #D89E00;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 0 14px 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
