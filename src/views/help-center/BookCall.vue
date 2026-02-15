<template>
  <div class="book-call">
    <h1 class="text-center mb-5">{{ $t('bookCall') }}</h1>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="booking-form">
        <div class="form-group">
          <label for="name">Name *</label>
          <input type="text" id="name" v-model="form.name" required placeholder="Your full name">
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" v-model="form.email" required placeholder="your.email@example.com">
        </div>

        <div class="form-group">
          <label for="company">Company</label>
          <input type="text" id="company" v-model="form.company" placeholder="Your company name">
        </div>

        <div class="form-group">
          <label for="topic">Topic *</label>
          <select id="topic" v-model="form.topic" required>
            <option value="">Select a topic</option>
            <option value="setup">Setup Help</option>
            <option value="pricing">Pricing</option>
            <option value="team">Team Collaboration</option>
          </select>
        </div>

        <div class="form-group">
          <label for="message">Additional Notes</label>
          <textarea id="message" v-model="form.message" rows="4"
            placeholder="Any specific questions or requirements?"></textarea>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Submitting...' : 'Book My Call' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  company: '',
  topic: '',
  message: ''
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Reset form
  form.value = {
    name: '',
    email: '',
    company: '',
    topic: '',
    message: ''
  }

  isSubmitting.value = false

  // Show success message (you can use your preferred notification system)
  alert('Thank you! We will contact you shortly to schedule your call.')
}
</script>

<style scoped>
.book-call {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--accent);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #0095d4;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (width <= 640px) {
  .book-call {
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }
}
</style>