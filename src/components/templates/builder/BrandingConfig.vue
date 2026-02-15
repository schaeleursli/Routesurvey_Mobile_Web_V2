<template>
    <div class="branding-config">
        <h6 class="text-uppercase text-muted mb-3 font-weight-bold" style="font-size: 0.75rem;">Global Branding</h6>
        
        <div class="mb-4">
            <label class="form-label small fw-bold">Page Orientation</label>
            <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="orient" id="orient1" value="portrait" 
                    :checked="template?.snapshot?.orientation === 'portrait'" 
                    @change="updateOrientation('portrait')">
                <label class="btn btn-outline-secondary" for="orient1">
                    <i class="bi bi-file-earmark me-1"></i> Portrait
                </label>

                <input type="radio" class="btn-check" name="orient" id="orient2" value="landscape" 
                    :checked="template?.snapshot?.orientation === 'landscape'" 
                    @change="updateOrientation('landscape')">
                <label class="btn btn-outline-secondary" for="orient2">
                    <i class="bi bi-file-earmark-landscape me-1"></i> Landscape
                </label>
            </div>
        </div>

        <div class="mb-4">
            <label class="form-label small fw-bold">Cover Page Style</label>
            <div class="row g-2">
                <div class="col-6" v-for="preset in ['cover_clean_a', 'cover_technical_b', 'cover_presentation_c']" :key="preset">
                    <div class="card h-100 preset-card" 
                        :class="{ 'border-primary ring': branding.coverPreset === preset }"
                        @click="setBranding('coverPreset', preset)">
                        <div class="card-body text-center p-3">
                            <div class="display-6 text-muted mb-2"><i class="bi bi-file-earmark-image"></i></div>
                            <small>{{ preset.replace('cover_', '') }}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <label class="form-label small fw-bold">Header & Footer</label>
            <select class="form-select" v-model="branding.headerFooterPreset" @change="emit('update')">
                <option value="A">Standard (Logo Left)</option>
                <option value="B">Minimal (Text Only)</option>
                <option value="C">Compact</option>
            </select>
        </div>

         <div class="mb-4">
            <label class="form-label small fw-bold">Signature Block</label>
             <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="sig" id="sig1" value="None" v-model="branding.signaturePreset" @change="emit('update')">
                <label class="btn btn-outline-secondary" for="sig1">None</label>

                <input type="radio" class="btn-check" name="sig" id="sig2" value="Simple" v-model="branding.signaturePreset" @change="emit('update')">
                <label class="btn btn-outline-secondary" for="sig2">Simple</label>

                <input type="radio" class="btn-check" name="sig" id="sig3" value="Full" v-model="branding.signaturePreset" @change="emit('update')">
                <label class="btn btn-outline-secondary" for="sig3">Full</label>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    template: Object
});
const emit = defineEmits(['update']);

const branding = computed(() => props.template?.snapshot?.branding || {});

function setBranding(key, value) {
    if (props.template?.snapshot?.branding) {
        const newTemplate = {
            ...props.template,
            snapshot: {
                ...props.template.snapshot,
                branding: {
                    ...props.template.snapshot.branding,
                    [key]: value
                }
            }
        };
        emit('update', newTemplate);
    }
}
function updateOrientation(val) {
    if (props.template?.snapshot) {
        const newTemplate = {
            ...props.template,
            snapshot: {
                ...props.template.snapshot,
                orientation: val
            }
        };
        emit('update', newTemplate);
    }
}
</script>

<style scoped>
.preset-card { cursor: pointer; }
.ring { box-shadow: 0 0 0 2px var(--primary-color) inset; }
</style>
