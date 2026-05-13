<template>
  <div class="login-root">
    <!-- Background shapes -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="login-container">
      <!-- Left branding panel -->
      <div class="login-branding">
        <div class="branding-content">
          <div class="brand-icon-large">
            <MessageSquare :size="36" />
          </div>
          <h1 class="branding-title">Askly<span class="brand-dot">.</span></h1>
          <p class="branding-tagline">The smart Q&A platform<br/>for interactive classrooms.</p>
          
          <div class="branding-features">
            <div class="feature-row">
              <div class="feature-dot" style="background: #00C896;"></div>
              <span>Create live sessions in seconds</span>
            </div>
            <div class="feature-row">
              <div class="feature-dot" style="background: #1368CE;"></div>
              <span>Smart duplicate & spam detection</span>
            </div>
            <div class="feature-row">
              <div class="feature-dot" style="background: #FF3355;"></div>
              <span>Real-time upvoting & prioritization</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="login-form-panel">
        <div class="form-card">
          <div class="form-header">
            <h2 class="form-title">{{ isLogin ? 'Welcome back' : 'Create Account' }}</h2>
            <p class="form-subtitle">{{ isLogin ? 'Sign in to your professor portal' : 'Register as a professor' }}</p>
          </div>

          <form @submit.prevent="handleAuth" class="auth-form">
            <div v-if="error" class="error-banner">
              <AlertCircle :size="16" />
              <span>{{ error }}</span>
            </div>

            <div v-if="!isLogin" class="field-group">
              <label class="field-label">Full Name</label>
              <div class="input-wrapper">
                <User :size="18" class="input-icon" />
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Prof. Dr. Schmidt"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">University Email</label>
              <div class="input-wrapper">
                <Mail :size="18" class="input-icon" />
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="name@university.de"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="input-wrapper">
                <Lock :size="18" class="input-icon" />
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="••••••••"
                  class="form-input"
                  required
                />
              </div>
            </div>

            <button type="submit" :disabled="loading" class="submit-btn">
              <span v-if="!loading">{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
              <span v-else class="loading-dots">
                <span></span><span></span><span></span>
              </span>
            </button>
          </form>

          <div class="form-footer">
            <button @click="isLogin = !isLogin" class="toggle-btn">
              {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
              <span class="toggle-link">{{ isLogin ? 'Register' : 'Sign in' }}</span>
            </button>
          </div>
        </div>

        <router-link to="/" class="back-link">
          <ArrowLeft :size="16" />
          <span>Back to home</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { MessageSquare, ArrowLeft, Mail, Lock, User, AlertCircle } from 'lucide-vue-next';
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

<style scoped>
.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F0EDF5;
  position: relative;
  overflow: hidden;
}

.bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.04;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #46178f;
  top: -200px;
  right: -100px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #00C896;
  bottom: -100px;
  left: -50px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 960px;
  min-height: 580px;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(26, 10, 46, 0.12);
  position: relative;
  z-index: 10;
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* ═══ LEFT BRANDING ═══ */
.login-branding {
  flex: 1;
  background: linear-gradient(160deg, #1A0A2E 0%, #46178f 100%);
  padding: 56px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-branding::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(0, 200, 150, 0.08);
  bottom: -60px;
  right: -60px;
}

.branding-content {
  position: relative;
  z-index: 2;
}

.brand-icon-large {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 28px;
}

.branding-title {
  font-family: 'Outfit', sans-serif;
  font-size: 42px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.brand-dot {
  color: #00C896;
}

.branding-tagline {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 40px;
}

.branding-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.feature-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ═══ RIGHT FORM ═══ */
.login-form-panel {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.form-card {
  width: 100%;
  max-width: 360px;
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 14px;
  color: #6B6B80;
  font-weight: 500;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  color: #E21B3C;
  font-size: 13px;
  font-weight: 600;
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
  letter-spacing: 0.01em;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9E9EB0;
  pointer-events: none;
  transition: color 0.2s;
}

.form-input {
  width: 100%;
  height: 50px;
  background: #F5F3FA;
  border: 2px solid transparent;
  border-radius: 14px;
  padding: 0 16px 0 46px;
  font-size: 15px;
  font-weight: 500;
  color: #1A1A2E;
  outline: none;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: #B8B5C4;
}

.form-input:focus {
  background: white;
  border-color: #46178f;
  box-shadow: 0 0 0 4px rgba(70, 23, 143, 0.08);
}

.form-input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: #46178f;
}

.submit-btn {
  width: 100%;
  height: 52px;
  background: #46178f;
  color: white;
  border: none;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 0 #2E0E63;
  transition: all 0.15s ease;
  position: relative;
  top: 0;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  top: 2px;
  box-shadow: 0 2px 0 #2E0E63;
}

.submit-btn:active:not(:disabled) {
  top: 4px;
  box-shadow: 0 0px 0 #2E0E63;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading dots animation */
.loading-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: bounce-dots 1.2s infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes bounce-dots {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.form-footer {
  margin-top: 28px;
  text-align: center;
}

.toggle-btn {
  font-size: 14px;
  color: #6B6B80;
  font-weight: 500;
}

.toggle-link {
  color: #46178f;
  font-weight: 700;
  margin-left: 4px;
}

.toggle-btn:hover .toggle-link {
  text-decoration: underline;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  color: #9E9EB0;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s;
}

.back-link:hover {
  color: #46178f;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 768px) {
  .login-branding {
    display: none;
  }
  .login-container {
    max-width: 440px;
    border-radius: 24px;
    margin: 16px;
  }
}
</style>
