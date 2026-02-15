<template>
  <div class="tips-carousel-overlay" v-if="visible">
    <div class="tips-container">
      <div class="tips-header">
        <span class="pack-title">{{ currentPack.title }}</span>
        <button class="close-btn" @click="close">
            <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="carousel-viewport">
        <transition name="fade-slide" mode="out-in">
             <div class="tip-card" :key="currentTip.id" v-if="currentTip">
                <div class="tip-icon">
                    <i class="bi bi-lightbulb"></i>
                </div>
                <h3 class="tip-title">{{ currentTip.title }}</h3>
                <p class="tip-body">{{ currentTip.body }}</p>

                <div v-if="currentTip.ctaLabel" class="tip-action">
                    <button class="cta-btn" @click="handleCta(currentTip)">
                        {{ currentTip.ctaLabel }} <i class="bi bi-arrow-right"></i>
                    </button>
                </div>
            </div>
             <div class="tip-card mastery-card" v-else key="mastery">
                <div class="tip-icon mastery-icon">
                    <i class="bi bi-check-circle"></i>
                </div>
                <h3 class="tip-title">You're set.</h3>
                <p class="tip-body">Everything else is refinement.</p>
                
                <div class="tip-action">
                    <button class="cta-btn primary" @click="close">
                        Start Surveying
                    </button>
                </div>
            </div>
        </transition>
      </div>

      <div class="tips-footer">
          <div class="progress-dots">
              <span 
                v-for="(tip, idx) in currentPack.tips" 
                :key="tip.id" 
                class="dot"
                :class="{ active: idx === currentIndex, completed: idx < currentIndex }"
                @click="goTo(idx)"
              ></span>
              <span class="dot mastery-dot" :class="{ active: isMastery }"></span>
          </div>
          <div class="nav-controls">
              <button class="nav-btn" @click="prev" :disabled="currentIndex === 0">
                  <i class="bi bi-chevron-left"></i>
              </button>
              <button class="nav-btn" @click="next">
                  <i class="bi bi-chevron-right"></i>
              </button>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { FIELD_GUIDE_PACKS } from '@/config/field_guide_packs';

const props = defineProps({
    packId: {
        type: String,
        default: 'basic'
    },
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'complete']);
const router = useRouter();

const currentPack = computed(() => FIELD_GUIDE_PACKS.find(p => p.id === props.packId) || FIELD_GUIDE_PACKS[0]);
const currentIndex = ref(0);
const isMastery = computed(() => currentIndex.value >= currentPack.value.tips.length);

const currentTip = computed(() => {
    if (isMastery.value) return null;
    return currentPack.value.tips[currentIndex.value];
});

const next = () => {
    if (isMastery.value) {
        close();
    } else {
        currentIndex.value++;
    }
};

const prev = () => {
    if (currentIndex.value > 0) currentIndex.value--;
};

const goTo = (idx) => {
    currentIndex.value = idx;
};

const close = () => {
    emit('close');
    if (isMastery.value) {
        emit('complete');
    }
};

const handleCta = (tip) => {
    if (tip.ctaRoute) {
        emit('close');
        router.push(tip.ctaRoute);
    } else {
        next();
    }
};
</script>

<style scoped>
.tips-carousel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(0 0 0 / 50%);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.tips-container {
    width: 100%;
    max-width: 480px;
    background: var(--bg-surface, #fff);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgb(0 0 0 / 20%);
    padding: 2rem;
    position: relative;
    overflow: hidden;
}

.tips-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.pack-title {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-tertiary, #888);
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--text-secondary, #666);
}

.carousel-viewport {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.tip-card {
    text-align: center;
}

.tip-icon {
    font-size: 3rem;
    color: var(--accent, #0f62fe);
    margin-bottom: 1.5rem;
    opacity: 0.9;
}

.mastery-icon {
    color: var(--success, #28a745);
}

.tip-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
    color: var(--text-primary, #111);
}

.tip-body {
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--text-secondary, #444);
    margin-bottom: 2rem;
    max-width: 90%;
    margin-left: auto;
    margin-right: auto;
}

.tip-action {
    margin-top: 1rem;
}

.cta-btn {
    background: white;
    border: 1px solid var(--border, #ddd);
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-primary);
}

.cta-btn:hover {
    border-color: var(--accent, #0f62fe);
    color: var(--accent, #0f62fe);
}

.cta-btn.primary {
    background: var(--accent, #0f62fe);
    color: white;
    border: none;
}

.tips-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
}

.progress-dots {
    display: flex;
    gap: 0.5rem;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bg-alt, #eee);
    cursor: pointer;
    transition: all 0.2s;
}

.dot.active {
    background: var(--accent, #0f62fe);
    transform: scale(1.2);
}

.dot.completed {
    background: var(--text-tertiary, #aaa);
}

.mastery-dot {
    margin-left: 0.5rem;
    background: var(--success, #28a745);
    opacity: 0.3;
}
.mastery-dot.active {
    opacity: 1;
}

.nav-controls {
    display: flex;
    gap: 1rem;
}

.nav-btn {
    background: none;
    border: 1px solid var(--border, #eee);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
    background: var(--bg-alt, #eee);
}

.nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
