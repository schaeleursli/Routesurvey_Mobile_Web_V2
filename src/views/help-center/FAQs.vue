<template>
  <div class="faqs">
    <h1 class="text-center mb-5">{{ $t('faqs') }}</h1>

    <div class="faq-container">
      <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
        <div class="faq-question" :class="{ 'active': activeIndex === index }" @click="toggleFaq(index)">
          <h3>{{ faq.question }}</h3>
          <i class="bi" :class="activeIndex === index ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </div>
        <div class="faq-answer" :class="{ 'active': activeIndex === index }">
          <p>{{ faq.answer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeIndex = ref(null)

const faqs = ref([
  {
    question: 'How do I start my first survey?',
    answer: 'To start your first survey, download the RouteSurvey app, create an account, and click the "New Survey" button. Follow the on-screen instructions to set up your route parameters and begin documenting obstacles.'
  },
  {
    question: 'Can I work offline?',
    answer: 'Yes! RouteSurvey supports offline mode. All your data will be saved locally and synced when you regain internet connection. This is perfect for areas with poor connectivity.'
  },
  {
    question: 'How to generate reports?',
    answer: 'After completing your survey, go to the Reports section and select the survey you want to report on. Choose your preferred format (PDF or Excel) and click Generate. Your report will be ready in seconds.'
  },
  {
    question: 'How to invite team members?',
    answer: 'Navigate to the Team section in your dashboard, click "Invite Member" and enter their email address. They will receive an invitation to join your team and access shared surveys.'
  },
  {
    question: 'Where to contact support?',
    answer: 'You can contact our support team through the Contact Support page, email us at support@routesurvey.com, or use the in-app chat feature for immediate assistance.'
  }
])

const toggleFaq = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>

<style scoped>
.faqs {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.faq-container {
  margin-top: 2rem;
}

.faq-item {
  margin-bottom: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.faq-question {
  padding: 1.5rem;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.faq-question:hover {
  background: #f8f9fa;
}

.faq-question.active {
  background: #f8f9fa;
}

.faq-question h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.faq-question i {
  color: var(--accent);
  transition: transform 0.2s;
}

.faq-question.active i {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background: white;
}

.faq-answer.active {
  max-height: 500px;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.faq-answer p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

@media (width <= 640px) {
  .faqs {
    padding: 1rem;
  }

  .faq-question {
    padding: 1rem;
  }

  .faq-answer.active {
    padding: 1rem;
  }
}
</style>