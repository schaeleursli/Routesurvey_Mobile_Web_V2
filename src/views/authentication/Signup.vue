<template>
  <AuthShell>
      <AuthCard>
          <template #title>Create your account</template>
          <template #subtitle>Start surveying confidently today.</template>

          
          <div class="divider">
              <span>or</span>
          </div>

          <form @submit.prevent="handleSignup">
              <!-- Name Fields -->
               <div class="name-row">
                    <BaseFormField 
                        v-model="form.firstName"
                        placeholder="First name"
                        class="mb-3"
                    />
                     <BaseFormField 
                        v-model="form.lastName"
                        placeholder="Last name"
                        class="mb-3"
                    />
               </div>

              <BaseFormField 
                  v-model="form.email"
                  label="Email"
                  type="email"
                  placeholder="name@company.com"
                  :error="errors.email"
                  class="mb-3"
              />

              <BaseFormField 
                  v-model="form.password"
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  :error="errors.password"
                  class="mb-3"
              />
              
              <BaseButton type="submit" :loading="isLoading" class="w-100 mb-3" size="large">
                  Create Account
              </BaseButton>
          </form>

          <template #footer>
              <p>Already have an account? <router-link to="/login" class="link">Log in</router-link></p>
          </template>
      </AuthCard>
  </AuthShell>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import AuthShell from '@/components/auth/AuthShell.vue';
import AuthCard from '@/components/auth/AuthCard.vue';
import { BaseFormField, BaseButton } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
});

const errors = reactive({});

const handleSignup = async () => {
    isLoading.value = true;
    try {
        // Call auth store signup
        const res = await authStore.addUser({
             FirstName: form.firstName,
             LastName: form.lastName,
             Email: form.email,
             Password: form.password,
             Role: 'User'
        });
        
        if (res.result) {
            // Auto login or redirect
            router.push('/login');
        } else {
            console.error(res.message);
        }
    } catch (e) {
        console.error(e);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--text-tertiary, #888);
    font-size: 0.8rem;
    margin: 1.5rem 0;
}
.divider::before, .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--border, #eee);
}
.divider span {
    padding: 0 1rem;
}

.name-row {
    display: flex;
    gap: 1rem;
}
.link {
    color: var(--accent, #0f62fe);
    text-decoration: none;
    font-weight: 600;
}
</style>
