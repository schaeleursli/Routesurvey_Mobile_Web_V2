<template>
  <div class="contact-support">
    <h1 class="text-center mb-5">{{ $t('contactSupport') }}</h1>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="contact-form">
        <div class="form-group">
          <label for="name">Name *</label>
          <input type="text" id="name" v-model="form.name" required placeholder="Your full name">
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" v-model="form.email" required placeholder="your.email@example.com">
        </div>

        <div class="form-group">
          <label for="message">Message *</label>
          <textarea id="message" v-model="form.message" rows="6" required placeholder="How can we help you?"></textarea>
        </div>

        <div class="form-group">
          <label for="file">Attach Screenshot (Optional)</label>
          <input type="file" id="file" @change="handleFileChange" accept="image/*">
          <small class="file-hint">Supported formats: PNG, JPG, JPEG (max 5MB)</small>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
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
  message: '',
  file: null
})

const isSubmitting = ref(false)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB')
    event.target.value = ''
    return
  }
  form.value.file = file
}

const handleSubmit = async () => {
  isSubmitting.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Reset form
  form.value = {
    name: '',
    email: '',
    message: '',
    file: null
  }

  isSubmitting.value = false

  // Show success message
  alert('Thank you for your message! We will get back to you soon.')
}
</script>

<style scoped>
.contact-support {
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
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--accent);
}

textarea {
  resize: vertical;
  min-height: 150px;
}

input[type="file"] {
  padding: 0.5rem 0;
  border: none;
}

.file-hint {
  display: block;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.875rem;
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
  .contact-support {
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }
}
</style>