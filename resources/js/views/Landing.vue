<template>
  <div class="landing-root">
    <!-- Animated background shapes -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="landing-container">
      <!-- Left Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="brand-row">
            <div class="brand-icon">
              <MessageSquare :size="28" />
            </div>
            <span class="brand-name">Askly<span class="brand-dot">.</span></span>
          </div>

          <h1 class="hero-title">
            Ask without<br/>
            <span class="hero-gradient">raising your hand.</span>
          </h1>

          <p class="hero-subtitle">
            The anonymous Q&A tool for interactive classrooms. 
            Students ask freely, professors see what matters most.
          </p>

          <div class="hero-stats">
            <div class="stat-item">
              <Zap :size="18" class="stat-icon" />
              <span>Real-time</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <Shield :size="18" class="stat-icon" />
              <span>Anonymous</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <Brain :size="18" class="stat-icon" />
              <span>Smart Filter</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Join Card -->
      <div class="join-section">
        <div class="join-card">
          <div class="join-header">
            <h2 class="join-title">Join a Session</h2>
            <p class="join-desc">Enter the 6-digit code from your professor</p>
          </div>

          <form @submit.prevent="joinSession" class="join-form">
            <div class="code-input-wrapper">
              <input
                v-model="sessionCode"
                type="text"
                placeholder="ABC123"
                class="code-input"
                maxlength="6"
                autocomplete="off"
                spellcheck="false"
              />
              <div class="code-input-border"></div>
            </div>

            <button
              type="submit"
              :disabled="sessionCode.length < 6"
              class="join-btn"
            >
              <span>Enter Session</span>
              <ArrowRight :size="20" />
            </button>
          </form>

          <div class="divider-row">
            <div class="divider-line"></div>
            <span class="divider-text">OR</span>
            <div class="divider-line"></div>
          </div>

          <router-link to="/login" class="professor-btn">
            <BookOpen :size="18" />
            <span>Professor Login</span>
          </router-link>
        </div>
      </div>
    </div>

    <footer class="landing-footer">
      <span>Built for interactive classrooms — powered by Askly</span>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessageSquare, ArrowRight, BookOpen, Zap, Shield, Brain } from 'lucide-vue-next';

const router = useRouter();
const sessionCode = ref('');

const joinSession = () => {
  if (sessionCode.value.length === 6) {
    router.push(`/session/${sessionCode.value.toUpperCase()}`);
  }
};
</script>

<style scoped>
.landing-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #1A0A2E 0%, #2D1554 40%, #46178f 100%);
  position: relative;
  overflow: hidden;
  padding: 40px 24px;
}

/* ═══ BACKGROUND SHAPES ═══ */
.bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: #FF3355;
  top: -120px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #00C896;
  bottom: -80px;
  left: -80px;
  animation: float 10s ease-in-out infinite reverse;
}

.shape-3 {
  width: 250px;
  height: 250px;
  background: #FFB800;
  top: 50%;
  left: 10%;
  animation: float 12s ease-in-out infinite;
}

.shape-4 {
  width: 180px;
  height: 180px;
  background: #1368CE;
  top: 20%;
  right: 25%;
  animation: float 9s ease-in-out infinite reverse;
}

/* ═══ MAIN CONTAINER ═══ */
.landing-container {
  display: flex;
  align-items: center;
  gap: 80px;
  max-width: 1100px;
  width: 100%;
  position: relative;
  z-index: 10;
  animation: fadeIn 0.6s ease forwards;
}

/* ═══ HERO LEFT ═══ */
.hero-section {
  flex: 1;
  min-width: 0;
}

.hero-content {
  animation: fadeInUp 0.7s ease forwards;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
}

.brand-icon {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand-icon:hover {
  transform: rotate(-8deg) scale(1.05);
}

.brand-name {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.02em;
}

.brand-dot {
  color: #00C896;
}

.hero-title {
  font-family: 'Outfit', sans-serif;
  font-size: 56px;
  font-weight: 900;
  color: white;
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}

.hero-gradient {
  background: linear-gradient(135deg, #00C896 0%, #1368CE 50%, #FF3355 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  max-width: 440px;
  margin-bottom: 40px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-weight: 600;
}

.stat-icon {
  color: #00C896;
}

.stat-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

/* ═══ JOIN CARD RIGHT ═══ */
.join-section {
  flex-shrink: 0;
  animation: fadeInUp 0.8s ease 0.15s forwards;
  opacity: 0;
}

.join-card {
  width: 420px;
  background: white;
  border-radius: 28px;
  padding: 44px 40px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.join-header {
  text-align: center;
  margin-bottom: 32px;
}

.join-title {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.join-desc {
  font-size: 14px;
  color: #6B6B80;
  font-weight: 500;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-input-wrapper {
  position: relative;
}

.code-input {
  width: 100%;
  height: 64px;
  background: #F5F3FA;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 0 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.25em;
  color: #1A1A2E;
  text-transform: uppercase;
  outline: none;
  transition: all 0.25s ease;
}

.code-input::placeholder {
  color: #C5C0D4;
  font-size: 24px;
  letter-spacing: 0.3em;
}

.code-input:focus {
  background: white;
  border-color: #46178f;
  box-shadow: 0 0 0 4px rgba(70, 23, 143, 0.12);
}

.join-btn {
  width: 100%;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #46178f;
  color: white;
  border: none;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 0 #2E0E63;
  transition: all 0.15s ease;
  position: relative;
  top: 0;
}

.join-btn:hover:not(:disabled) {
  top: 2px;
  box-shadow: 0 2px 0 #2E0E63;
  background: #3b1278;
}

.join-btn:active:not(:disabled) {
  top: 4px;
  box-shadow: 0 0px 0 #2E0E63;
}

.join-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.divider-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #E8E5F0;
}

.divider-text {
  font-size: 12px;
  font-weight: 700;
  color: #9E9EB0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.professor-btn {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #F5F3FA;
  color: #46178f;
  border: 2px solid #E8E5F0;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.professor-btn:hover {
  background: white;
  border-color: #46178f;
  box-shadow: 0 4px 16px rgba(70, 23, 143, 0.1);
  transform: translateY(-2px);
}

/* ═══ FOOTER ═══ */
.landing-footer {
  margin-top: 60px;
  position: relative;
  z-index: 10;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 900px) {
  .landing-container {
    flex-direction: column;
    gap: 40px;
    text-align: center;
  }

  .hero-title {
    font-size: 40px;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-stats {
    justify-content: center;
  }

  .join-card {
    width: 100%;
    max-width: 420px;
  }
}
</style>
