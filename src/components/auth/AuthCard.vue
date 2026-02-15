<template>
    <div class="auth-card">
        <div class="auth-header">
            <h2><slot name="title"></slot></h2>
            <p><slot name="subtitle"></slot></p>
        </div>

        <slot name="top"></slot>

        <slot></slot>

        <div class="auth-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<style scoped>
.auth-card {
    width: 100%;
}

.auth-header {
    text-align: center;
    margin-bottom: 2rem;
}

.auth-header h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
}

.auth-header p {
    color: var(--text-secondary);
    font-size: 1rem;
}

.auth-footer {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-secondary);
}
</style>
