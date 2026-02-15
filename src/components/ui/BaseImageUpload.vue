<template>
    <div class="base-image-upload">
        <div class="base-image-upload__container">
            <img :src="imageUrl" :alt="alt" :class="[
                'base-image-upload__image',
                `base-image-upload__image--${size}`
            ]" />
            <button type="button" class="base-image-upload__edit-btn" :title="editTitle" @click="triggerUpload">
                <PhPencilSimple :size="16" />
            </button>
            <input ref="fileInput" type="file" accept="image/*" style="display: none;" @change="handleFileChange" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { PhPencilSimple } from '@phosphor-icons/vue';

const props = defineProps({
    imageUrl: {
        type: String,
        required: true
    },
    alt: {
        type: String,
        default: 'Image'
    },
    size: {
        type: String,
        default: 'medium',
        validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    editTitle: {
        type: String,
        default: 'Change image'
    }
})

const emit = defineEmits(['change', 'error'])

const fileInput = ref(null)

const triggerUpload = () => {
    fileInput.value?.click()
}

const checkFile = (file) => {
    // 1. Validate Size (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
        return { valid: false, message: 'File size exceeds 10MB limit.' };
    }

    // 2. Validate Type (Allow jpg, png, webp)
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, message: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' };
    }

    return { valid: true };
}

const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
        const validation = checkFile(file);
        if (!validation.valid) {
            // Reset input so user can try again
            event.target.value = '';
            
            // Emit error (parent should handle showing a toast/alert)
            emit('error', validation.message);
            // Fallback alert if parent doesn't handle error
            alert(validation.message); 
            return;
        }
        
        emit('change', file)
    }
}
</script>

<style scoped>
.base-image-upload {
    display: inline-block;
}

.base-image-upload__container {
    position: relative;
    display: inline-block;
}

.base-image-upload__image {
    display: block;
    background-color: var(--bg-elevated);
    border-radius: var(--radius-xl);
    object-fit: cover;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-normal);
}

.base-image-upload__image--small {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-lg);
}

.base-image-upload__image--medium {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-xl);
}

.base-image-upload__image--large {
    width: 110px;
    height: 110px;
    border-radius: var(--radius-2xl);
}

.base-image-upload__edit-btn {
    position: absolute;
    bottom: var(--spacing-xs);
    right: var(--spacing-xs);
    background-color: rgb(44 62 80 / 70%);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: var(--font-size-sm);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
}

.base-image-upload__edit-btn:hover {
    background-color: var(--accent);
    transform: scale(1.1);
}

.base-image-upload__edit-btn i {
    line-height: 0;
}
</style>
