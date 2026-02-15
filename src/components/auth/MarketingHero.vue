<template>
    <div class="marketing-hero">
        <div class="brand-content">
            <div class="brand-logo-container">
                <img src="@/assets/logo.png" alt="RouteSurvey Logo" class="brand-logo" />
                <span class="brand-name">RouteSurvey</span>
            </div>
            
            <h1 class="hero-title">Survey Routes with Confidence.</h1>
            <p class="hero-subtitle">The enterprise standard for heavy-haul logistics and route planning.</p>
            
            <div class="hero-features">
                 <div class="feature-item">
                    <PhCheckCircle :size="18" weight="fill" />
                    <span>Offline-first Capabilities</span>
                </div>
                 <div class="feature-item">
                    <PhCheckCircle :size="18" weight="fill" />
                    <span>Precision Mapping</span>
                </div>
                 <div class="feature-item">
                    <PhCheckCircle :size="18" weight="fill" />
                    <span>Collaborative Reports</span>
                </div>
            </div>

            <div class="trust-row">
                 <span class="trust-label">Trusted by leading EPCs</span>
                 <div class="trust-dots">
                    <span>•</span><span>•</span><span>•</span>
                 </div>
            </div>

             <div class="brand-footer">
                <span>© {{ new Date().getFullYear() }} RouteSurvey Inc.</span>
            </div>
        </div>
        <div class="brand-pattern"></div>
    </div>
</template>

<script setup>
import { PhCheckCircle } from '@phosphor-icons/vue';
</script>


<style scoped>
.marketing-hero {
    height: 100%;
    width: 100%;
    background-color: #0F172A; /* Dark base */
    position: relative;
    overflow: hidden;
    color: white;
    padding: var(--spacing-2xl);
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* Gradient Mesh Background */
.marketing-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
        radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
        radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
    z-index: 0;
}

.marketing-hero::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: 
        radial-gradient(circle at 50% 50%, rgba(15, 98, 254, 0.15), transparent 40%),
        radial-gradient(circle at 10% 20%, rgba(120, 50, 255, 0.15), transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(10, 200, 255, 0.15), transparent 40%);
    filter: blur(60px);
    animation: meshMove 20s ease-in-out infinite alternate;
    z-index: 1;
    pointer-events: none;
}

@keyframes meshMove {
    0% { transform: translate(0, 0) rotate(0deg) scale(1); }
    33% { transform: translate(-2%, 2%) rotate(2deg) scale(1.05); }
    66% { transform: translate(2%, -1%) rotate(-1deg) scale(0.95); }
    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
}

/* Animations */
.brand-logo-container {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-2xl);
    animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.hero-title {
    position: relative;
    z-index: 2;
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    letter-spacing: -1px;
    opacity: 0;
    text-shadow: 0 4px 12px rgba(0,0,0,0.1);
    animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
}

.hero-subtitle {
    position: relative;
    z-index: 2;
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: var(--spacing-2xl);
    font-weight: 300;
    max-width: 480px;
    line-height: 1.6;
    opacity: 0;
    animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
}

.hero-features {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-2xl);
    opacity: 0;
    animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    font-size: 1.1rem;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feature-item i {
    color: #4ade80; /* Brighter green */
    filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.4));
}

.trust-row {
    position: relative;
    z-index: 2;
    opacity: 0;
    margin-top: auto;
    animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
}

.trust-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
    opacity: 0.7;
}

.trust-dots {
    display: flex;
    gap: var(--spacing-md);
    font-size: 1.5rem;
    opacity: 0.5;
}

.brand-footer {
    position: absolute;
    bottom: 2rem;
    left: 4rem;
    opacity: 0.4;
    font-size: 0.875rem;
    z-index: 2;
}

.brand-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(rgb(255 255 255 / 10%) 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.3;
    pointer-events: none;
    z-index: 1;
    mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 100%);
}

.brand-logo {
    width: 48px;
    height: auto;
    filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
}

.brand-name {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.5px;
}
</style>
