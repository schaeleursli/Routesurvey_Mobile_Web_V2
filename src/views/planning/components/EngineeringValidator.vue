<template>
  <div class="engineering-validator">
    <div class="card border-0 shadow-sm" :class="statusDetails.borderClass">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
            <i class="bi me-2" :class="statusDetails.icon"></i>
            Engineering Check
        </h5>
        <span class="badge" :class="statusDetails.badgeClass">{{ statusDetails.label }}</span>
      </div>
      
      <div class="card-body">
        <!-- Main Metrics Grid -->
        <div class="row text-center mb-4">
            <div class="col-md-2 col-6 mb-2">
                <div class="metric-box">
                    <div class="label">Gross Weight</div>
                    <div class="value">{{ formatWeight(metrics.totalWeight_kg) }}</div>
                </div>
            </div>
            <div class="col-md-2 col-6 mb-2">
                <div class="metric-box">
                    <div class="label">Axle Load (Avg)</div>
                    <div class="value" :class="{'text-danger': metrics.axleLoad_kg > 12000}">
                        {{ formatWeight(metrics.axleLoad_kg) }}
                    </div>
                </div>
            </div>
             <div class="col-md-2 col-6 mb-2">
                <div class="metric-box">
                    <div class="label">Total Length</div>
                    <div class="value">{{ formatDim(metrics.totalLength_m) }}</div>
                </div>
            </div>
             <div class="col-md-2 col-6 mb-2">
                <div class="metric-box">
                    <div class="label">Total Width</div>
                    <div class="value">{{ formatDim(metrics.totalWidth_m) }}</div>
                </div>
            </div>
             <div class="col-md-2 col-6 mb-2">
                <div class="metric-box">
                    <div class="label">Total Height</div>
                    <div class="value" :class="{'text-warning': metrics.totalHeight_m > 4.5}">
                        {{ formatDim(metrics.totalHeight_m) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Messages List -->
        <div v-if="result.messages && result.messages.length > 0" class="validation-messages">
            <div v-for="(msg, idx) in result.messages" :key="idx" class="alert d-flex align-items-center" :class="getAlertClass(msg.severity)">
               <i class="bi me-2" :class="getIconClass(msg.severity)"></i>
               <div>
                   <strong>{{ getSeverityLabel(msg.severity) }}:</strong> {{ msg.message }}
               </div>
            </div>
        </div>
        <div v-else class="alert alert-success d-flex align-items-center">
            <i class="bi bi-check-circle-fill me-2"></i>
            <div>All generic engineering checks passed.</div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  result: {
    type: Object,
    required: true,
    default: () => ({ isValid: true, status: 'valid', messages: [], metrics: {} })
  }
});

const metrics = computed(() => props.result.metrics || {});

// Formatting Helpers
const formatWeight = (val) => {
    if (!val) return '0 t';
    return (val / 1000).toFixed(1) + ' t';
};

const formatDim = (val) => {
    if (!val) return '0.00 m';
    return val.toFixed(2) + ' m';
};

// UI Styling Logic
const statusDetails = computed(() => {
    switch (props.result.status) {
        case 'error':
            return { label: 'BLOCKING ISSUES', badgeClass: 'bg-danger', borderClass: 'border-danger', icon: 'bi-exclamation-octagon-fill text-danger' };
        case 'warning':
            return { label: 'WARNINGS', badgeClass: 'bg-warning text-dark', borderClass: 'border-warning', icon: 'bi-exclamation-triangle-fill text-warning' };
        default:
            return { label: 'VALID', badgeClass: 'bg-success', borderClass: 'border-success', icon: 'bi-check-circle-fill text-success' };
    }
});

const getAlertClass = (severity) => {
    switch (severity) {
        case 'critical': return 'alert-danger';
        case 'error': return 'alert-danger';
        case 'warning': return 'alert-warning';
        default: return 'alert-info';
    }
};

const getIconClass = (severity) => {
     switch (severity) {
        case 'critical': return 'bi-radioactive';
        case 'error': return 'bi-x-circle';
        case 'warning': return 'bi-cone-striped';
        default: return 'bi-info-circle';
    }
};

const getSeverityLabel = (sev) => sev.toUpperCase();

</script>

<style scoped>
.metric-box {
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 6px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.metric-box .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #6c757d;
    font-weight: 600;
}

.metric-box .value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #212529;
}
</style>
