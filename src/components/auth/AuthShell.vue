<template>
    <div class="auth-shell">
        <div class="marketing-side">
            <MarketingHero />
        </div>
        <div class="form-side">
            <div class="form-wrapper">
                <div class="mobile-header">
                     <img src="@/assets/logo.png" alt="RouteSurvey" class="mobile-logo" />
                </div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import MarketingHero from './MarketingHero.vue';
</script>

<style scoped>
.auth-shell {
    display: flex;
    min-height: 100vh;
    background: var(--bg-surface, #fff);
}

.marketing-side {
    flex: 1;
    display: none; /* Mobile first hidden */
}

.form-side {
    flex: 1;
    background: var(--bg-surface, #fff);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    width: 100%;
}

.form-wrapper {
    width: 100%;
    max-width: 420px;
}

.mobile-header {
    display: block;
    text-align: center;
    margin-bottom: 2rem;
}

.mobile-logo {
    width: 64px;
}

@media (width >= 992px) {
    .marketing-side {
        display: block;
        max-width: 50%;
    }

    .mobile-header {
        display: none;
    }

    .auth-shell {
        background: var(--bg-base, #f8f9fa);
    }

    .form-side {
        max-width: 50%;
        background: var(--bg-surface, #fff);
    }
}
</style>
