<template>
  <div class="help-center-home">
    <!-- Hero Section -->
    <div class="hero-section text-center mb-5">
        <h1 class="display-4 fw-bold mb-3">{{ $t('dashboard') }}</h1>
        <p class="text-muted mb-4 lead">How can we help you today?</p>
        
        <div class="hero-search mx-auto" style="max-width: 600px;">
            <IconField iconPosition="left">
                <PhMagnifyingGlass :size="18" />
                <InputText 
                    v-model="searchQuery" 
                    placeholder="Search for articles, guides, and tutorials..." 
                    class="w-100 p-3 rounded-pill shadow-sm border-0"
                    style="font-size: 1.1rem;"
                />
            </IconField>
        </div>
    </div>

    <!-- Quick Links Grid -->
    <div class="help-grid">
      <router-link to="/help-center/quick-start" class="feature-card">
        <div class="icon-box bg-blue-100 text-blue-600">
           <PhRocketLaunch :size="28" weight="fill" />
        </div>
        <div class="content">
            <h3>{{ $t('quickStart') }}</h3>
            <p>Get started with RouteSurvey in 5 simple steps</p>
        </div>
        <PhArrowRight :size="18" class="action-icon" />
      </router-link>

      <router-link to="/help-center/tutorials" class="feature-card">
        <div class="icon-box bg-purple-100 text-purple-600">
           <PhPlayCircle :size="28" weight="fill" />
        </div>
        <div class="content">
            <h3>{{ $t('tutorials') }}</h3>
            <p>Watch step-by-step guides for all features</p>
        </div>
        <PhArrowRight :size="18" class="action-icon" />
      </router-link>

      <router-link to="/help-center/faqs" class="feature-card">
        <div class="icon-box bg-green-100 text-green-600">
           <PhQuestionMark :size="28" weight="fill" />
        </div>
        <div class="content">
            <h3>{{ $t('faqs') }}</h3>
            <p>Find answers to common questions</p>
        </div>
        <PhArrowRight :size="18" class="action-icon" />
      </router-link>

      <router-link to="/help-center/book-call" class="feature-card">
        <div class="icon-box bg-orange-100 text-orange-600">
           <PhCalendarCheck :size="28" weight="fill" />
        </div>
        <div class="content">
            <h3>{{ $t('bookCall') }}</h3>
            <p>Schedule a free setup consultation</p>
        </div>
        <PhArrowRight :size="18" class="action-icon" />
      </router-link>

      <router-link to="/help-center/contact-support" class="feature-card">
        <div class="icon-box bg-red-100 text-red-600">
           <PhHeadset :size="28" />
        </div>
        <div class="content">
            <h3>{{ $t('contactSupport') }}</h3>
            <p>Get help from our support team</p>
        </div>
        <PhArrowRight :size="18" class="action-icon" />
      </router-link>

      <router-link to="/request-account" class="feature-card">
        <div class="icon-box bg-gray-100 text-gray-600">
           <PhUserPlus :size="28" />
        </div>
        <div class="content">
            <h3>{{ $t('requestAccount') }}</h3>
            <p>Request access to our platform</p>
        </div>
        <PhArrowRight :size="18" class="action-icon" />
      </router-link>
    </div>

    <!-- Contact Banner -->
    <div class="contact-banner mt-5 p-4 rounded-4 text-center bg-light">
        <h4>Still need help?</h4>
        <p class="text-muted">Our support team is available 24/7 to assist you.</p>
        <Button label="Chat with us" severity="secondary" rounded>
            <template #icon>
                <PhChatsCircle :size="18" class="me-2" />
            </template>
        </Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import {
    PhMagnifyingGlass, PhRocketLaunch, PhArrowRight, PhPlayCircle,
    PhQuestionMark, PhCalendarCheck, PhHeadset, PhUserPlus, PhChatsCircle
} from '@phosphor-icons/vue';

const searchQuery = ref('');
</script>

<style scoped>
.help-center-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid transparent;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 5%), 0 2px 4px -1px rgb(0 0 0 / 3%);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%), 0 4px 6px -2px rgb(0 0 0 / 5%);
  border-color: rgba(var(--primary-color-rgb, 0, 123, 255), 0.1);
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

/* Color Utilities for Icons */
.bg-blue-100 { background-color: #e0f2fe; }
.text-blue-600 { color: var(--accent); }
.bg-purple-100 { background-color: #f3e8ff; }
.text-purple-600 { color: #9333ea; }
.bg-green-100 { background-color: #dcfce7; }
.text-green-600 { color: var(--success); }
.bg-orange-100 { background-color: #ffedd5; }
.text-orange-600 { color: #ea580c; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-600 { color: #dc2626; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-600 { color: #4b5563; }

.content {
  flex: 1;
}

.content h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.content p {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.4;
}

.action-icon {
  color: #d1d5db;
  transition: transform 0.2s, color 0.2s;
}

.feature-card:hover .action-icon {
  color: var(--primary-color, #007bff);
  transform: translateX(4px);
}
</style>