<template>
  <!-- Loading -->
  <div v-if="!session" class="student-loading">
    <div class="spinner"></div>
  </div>

  <div v-else class="student-root">
    <!-- Header -->
    <header class="student-header" :style="{ borderBottomColor: session.accent_color }">
      <div class="header-inner">
        <div class="header-left">
          <div class="session-icon" :style="{ background: session.accent_color }">
            <span>A.</span>
          </div>
          <div class="session-meta">
            <h1 class="header-title">{{ session.title }}</h1>
            <span class="header-sub">Askly Live Session</span>
          </div>
        </div>
        <div class="header-right">
          <div class="status-pill" :class="session.is_active ? 'status-live' : 'status-closed'">
            <span class="status-dot"></span>
            <span>{{ session.is_active ? 'Live' : 'Closed' }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="student-main">
      <!-- Description -->
      <div v-if="session.description" class="info-banner">
        <Info :size="18" class="info-icon" />
        <p>{{ session.description }}</p>
      </div>

      <!-- Question Feed -->
      <div class="student-feed">
        <!-- Empty -->
        <div v-if="questions.length === 0" class="feed-empty">
          <div class="empty-bubble">
            <MessageSquare :size="32" />
          </div>
          <h3>No questions yet</h3>
          <p>Be the first to ask something!</p>
        </div>

        <!-- Question Cards -->
        <div
          v-for="(q, index) in questions"
          :key="q.id"
          class="student-qcard"
          :class="{ 'is-pinned': q.status === 'pinned' }"
          :style="{ animationDelay: `${index * 0.04}s` }"
        >
          <!-- Pinned indicator -->
          <div v-if="q.status === 'pinned'" class="pin-ribbon">
            <Pin :size="12" />
            <span>Pinned</span>
          </div>

          <div class="qcard-inner">
            <!-- Upvote button -->
            <button
              @click="toggleUpvote(q)"
              class="upvote-btn"
              :class="{ upvoted: upvotedQuestions.has(q.id) }"
            >
              <ChevronUp :size="22" />
              <span class="upvote-count">{{ q.upvote_count }}</span>
            </button>

            <!-- Content -->
            <div class="qcard-content">
              <p class="qcard-text">{{ q.content }}</p>
              <span v-if="q.status === 'answered'" class="answered-tag">
                <Check :size="12" />
                Answered
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Fixed Ask Bar -->
    <div v-if="session.is_active" class="ask-bar">
      <div class="ask-bar-inner">
        <form @submit.prevent="submitQuestion" class="ask-form">
          <input
            v-model="newQuestion"
            type="text"
            placeholder="Ask an anonymous question..."
            class="ask-input"
            maxlength="250"
            required
            :disabled="submitting"
          />
          <button
            type="submit"
            :disabled="!newQuestion.trim() || submitting"
            class="ask-submit"
          >
            <Send :size="20" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { MessageSquare, ChevronUp, Send, Pin, Info, Check } from 'lucide-vue-next';
import api from '../api';

const route = useRoute();
const sessionCode = route.params.id;
const session = ref(null);
const questions = ref([]);
const newQuestion = ref('');
const submitting = ref(false);

const getVoterId = () => {
  let id = localStorage.getItem('voter_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('voter_id', id);
  }
  return id;
};

const voterId = getVoterId();
const upvotedQuestions = ref(new Set());
let pollInterval = null;

const loadData = async () => {
  try {
    if (!session.value) {
      const { data } = await api.get(`/sessions/${sessionCode}`);
      session.value = data;
    }
    const { data: qData } = await api.get(`/sessions/${session.value.id}/questions`);
    questions.value = qData;
    const stored = JSON.parse(localStorage.getItem(`upvotes_${session.value.id}`) || '[]');
    upvotedQuestions.value = new Set(stored);
  } catch (err) {
    console.error(err);
    if (err.response?.status === 404) {
      alert('Session not found');
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
    if (data.status === 'filtered') {
      alert('Your question was flagged and will be reviewed by the professor.');
    } else if (data.is_duplicate) {
      alert('This question is similar to an existing one. It has been grouped.');
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
  const isUpvoted = upvotedQuestions.value.has(q.id);
  if (isUpvoted) {
    upvotedQuestions.value.delete(q.id);
    q.upvote_count--;
  } else {
    upvotedQuestions.value.add(q.id);
    q.upvote_count++;
  }
  localStorage.setItem(`upvotes_${session.value.id}`, JSON.stringify([...upvotedQuestions.value]));
  try {
    await api.post(`/questions/${q.id}/upvote`, { voter_id: voterId });
  } catch (err) {
    if (isUpvoted) { upvotedQuestions.value.add(q.id); q.upvote_count++; }
    else { upvotedQuestions.value.delete(q.id); q.upvote_count--; }
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
.student-loading {
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

.student-root {
  min-height: 100vh;
  background: #F0EDF5;
  display: flex;
  flex-direction: column;
}

/* ═══ HEADER ═══ */
.student-header {
  background: white;
  border-bottom: 4px solid #46178f;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 14px;
}

.session-meta {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1.2;
}

.header-sub {
  font-size: 12px;
  color: #9E9EB0;
  font-weight: 600;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-live {
  background: rgba(38, 137, 12, 0.08);
  color: #26890C;
}

.status-live .status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #26890C;
  animation: pulse-glow 2s ease infinite;
}

.status-closed {
  background: #F5F3FA;
  color: #9E9EB0;
}

.status-closed .status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #E21B3C;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(38, 137, 12, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(38, 137, 12, 0); }
}

/* ═══ MAIN ═══ */
.student-main {
  flex: 1;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 20px 140px;
}

.info-banner {
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  background: white;
  border-radius: 14px;
  border: 1px solid #E8E5F0;
  margin-bottom: 20px;
}

.info-icon {
  color: #9E9EB0;
  flex-shrink: 0;
  margin-top: 1px;
}

.info-banner p {
  font-size: 14px;
  color: #6B6B80;
  font-weight: 500;
  line-height: 1.5;
}

/* ═══ FEED ═══ */
.student-feed {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feed-empty {
  text-align: center;
  padding: 64px 32px;
}

.empty-bubble {
  width: 72px;
  height: 72px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #9E9EB0;
  box-shadow: 0 4px 16px rgba(26, 10, 46, 0.06);
}

.feed-empty h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.feed-empty p {
  font-size: 14px;
  color: #6B6B80;
  font-weight: 500;
}

/* ═══ QUESTION CARDS ═══ */
.student-qcard {
  background: white;
  border-radius: 16px;
  padding: 18px 20px;
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}

.student-qcard:hover {
  border-color: #E8E5F0;
}

.student-qcard.is-pinned {
  border-color: #D89E00;
  background: #FFFDF5;
}

.pin-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 12px;
  background: #D89E00;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 0 14px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.qcard-inner {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.upvote-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 56px;
  border-radius: 14px;
  border: 2px solid #E8E5F0;
  background: #F5F3FA;
  color: #6B6B80;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.upvote-btn:hover {
  border-color: #D4D0E0;
  background: #EFEAFC;
  transform: scale(1.04);
}

.upvote-btn.upvoted {
  border-color: #FF3355;
  background: rgba(255, 51, 85, 0.08);
  color: #FF3355;
}

.upvote-count {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

.qcard-content {
  flex: 1;
  padding-top: 4px;
}

.qcard-text {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
  line-height: 1.5;
}

.answered-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 3px 10px;
  background: rgba(38, 137, 12, 0.08);
  color: #26890C;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ═══ ASK BAR ═══ */
.ask-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  border-top: 1px solid #E8E5F0;
  padding: 16px 20px;
  z-index: 100;
}

.ask-bar-inner {
  max-width: 720px;
  margin: 0 auto;
}

.ask-form {
  display: flex;
  gap: 10px;
}

.ask-input {
  flex: 1;
  height: 52px;
  background: #F0EDF5;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 500;
  color: #1A1A2E;
  outline: none;
  transition: all 0.2s;
}

.ask-input::placeholder {
  color: #9E9EB0;
}

.ask-input:focus {
  background: white;
  border-color: #46178f;
  box-shadow: 0 0 0 4px rgba(70, 23, 143, 0.08);
}

.ask-submit {
  width: 52px;
  height: 52px;
  background: #46178f;
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 0 #2E0E63;
  transition: all 0.15s;
  position: relative;
  top: 0;
  flex-shrink: 0;
}

.ask-submit:hover:not(:disabled) {
  top: 2px;
  box-shadow: 0 2px 0 #2E0E63;
}

.ask-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
