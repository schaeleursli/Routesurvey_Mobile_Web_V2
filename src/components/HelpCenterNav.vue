<template>
  <nav class="help-center-nav">
    <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" active-class="active">
      {{ $t(item.label) }}
    </router-link>
  </nav>
</template>

<script setup>
const navItems = [
  { path: '/help-center', label: 'Home' },
  { path: '/help-center/quick-start', label: 'Quick Start' },
  { path: '/help-center/tutorials', label: 'Tutorials' },
  { path: '/help-center/best-practices', label: 'Best Practices' },
  { path: '/help-center/faqs', label: 'FAQs' },
  { path: '/help-center/book-call', label: 'Book a Call' },
  { path: '/help-center/contact-support', label: 'Contact Support' }
]
</script>

<style scoped>
.help-center-nav {
  background: white;
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-item {
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f8f9fa;
  color: var(--accent);
}

.nav-item.active {
  background: var(--accent);
  color: white;
}

@media (width <= 768px) {
  .help-center-nav {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-item {
    width: 100%;
    text-align: center;
  }
}
</style>