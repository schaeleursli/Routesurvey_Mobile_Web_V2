<template>
    <div class="subscription-plans-admin">
        <BasePanel :title="$t('subscriptionPlans')" subtitle="Manage subscription plans and features" elevation="level2"
            :scrollable="true">
            <div class="subscription-plans-admin__grid">
                <!-- Core Plan Card -->
                <BaseCard class="subscription-plans-admin__card" variant="success">
                    <template #header>
                        <div class="plan-card__header">
                            <h3 class="plan-card__title">Core Plan</h3>
                            <div class="plan-card__badge">
                                <span class="plan-card__badge-text">Core</span>
                            </div>
                        </div>
                    </template>

                    <div class="plan-card__content">
                        <StatusIndicator status="verified" title="Core Plan Active"
                            description="Default plan with essential features" />

                        <div class="plan-card__price">
                            <span class="plan-card__price-label">{{ $t('price') }}:</span>
                            <span class="plan-card__price-value">${{ freePlan.monthlyPrice }} {{ $t('perMonth')
                                }}</span>
                        </div>

                        <div class="plan-card__features">
                            <h4 class="plan-card__features-title">{{ $t('features') }}:</h4>
                            <ul class="plan-card__features-list">
                                <li v-for="(feature, index) in featureOptions" :key="feature.id"
                                    :class="{ 'plan-card__feature--disabled': !freePlan.features[feature.id] }"
                                    v-show="showAllFeatures || index < 5">
                                    <i v-if="freePlan.features[feature.id]"
                                        class="bi bi-check-circle-fill plan-card__feature-icon--enabled"></i>
                                    <i v-else class="bi bi-x-circle-fill plan-card__feature-icon--disabled"></i>
                                    <span class="plan-card__feature-text">{{ feature.name }}</span>
                                </li>
                            </ul>
                            <BaseButton variant="ghost" size="small" @click="showAllFeatures = !showAllFeatures">
                                {{ showAllFeatures ? 'Show Less' : 'Show More' }}
                            </BaseButton>
                        </div>
                    </div>
                </BaseCard>

                <!-- New Plan Card -->
                <BaseCard v-if="showNewPlanCard" class="subscription-plans-admin__card" variant="default">
                    <template #header>
                        <h3 class="plan-card__title">{{ $t('newPlan') }}</h3>
                    </template>

                    <div class="plan-card__content">
                        <StatusIndicator status="caution" title="Creating New Plan"
                            description="Configure your custom subscription plan" />

                        <BaseFormField v-model="newPlan.name" :label="$t('planName')" :placeholder="$t('enterPlanName')"
                            :error="newPlan.name.length === 0 ? 'Plan name is required' : null" />

                        <div class="plan-card__price-inputs">
                            <BaseFormField v-model.number="newPlan.monthlyPrice" type="number"
                                :label="$t('monthlyPrice')" placeholder="0.00"
                                :error="newPlan.monthlyPrice < 0 ? 'Price must be non-negative' : null" />
                            <BaseFormField v-model.number="newPlan.yearlyPrice" type="number" :label="$t('yearlyPrice')"
                                placeholder="0.00"
                                :error="newPlan.yearlyPrice < 0 ? 'Price must be non-negative' : null" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">{{ $t('features') }}</label>
                            <select v-model="newPlan.features" multiple class="form-control" style="min-height: 150px;">
                                <option v-for="feature in featureOptions" :key="feature.id" :value="feature.id">
                                    {{ feature.name }}
                                </option>
                            </select>
                            <small class="form-text text-muted">Select multiple features for this plan (Hold
                                Ctrl/Cmd)</small>
                        </div>
                    </div>

                    <template #footer>
                        <div class="plan-card__actions">
                            <BaseButton variant="primary" size="small" @click="saveNewPlan" left-icon="bi bi-save">
                                {{ $t('save') }}
                            </BaseButton>
                            <BaseButton variant="secondary" size="small" @click="cancelNewPlan" left-icon="bi bi-x">
                                {{ $t('cancel') }}
                            </BaseButton>
                        </div>
                    </template>
                </BaseCard>

                <!-- Existing Plans -->
                <BaseCard v-for="(plan, idx) in plans" :key="plan.id" class="subscription-plans-admin__card"
                    variant="default">
                    <template #header>
                        <h3 class="plan-card__title">{{ plan.name || $t('newPlan') }}</h3>
                    </template>

                    <div v-if="!plan.isEditing" class="plan-card__content">
                        <StatusIndicator status="verified" title="Plan Active"
                            description="Available for subscription" />

                        <div class="plan-card__price">
                            <span class="plan-card__price-label">{{ $t('price') }}:</span>
                            <span class="plan-card__price-value">${{ plan.price }} {{ $t('perMonth') }}</span>
                        </div>

                        <div class="plan-card__features">
                            <h4 class="plan-card__features-title">{{ $t('features') }}:</h4>
                            <ul class="plan-card__features-list">
                                <li v-for="(feature, index) in featureOptions" :key="feature.id"
                                    :class="{ 'plan-card__feature--disabled': !plan.features.includes(feature.id) }"
                                    v-show="showAllFeatures || index < 5">
                                    <i v-if="plan.features.includes(feature.id)"
                                        class="bi bi-check-circle-fill plan-card__feature-icon--enabled"></i>
                                    <i v-else class="bi bi-x-circle-fill plan-card__feature-icon--disabled"></i>
                                    <span class="plan-card__feature-text">{{ feature.name }}</span>
                                </li>
                            </ul>
                            <BaseButton variant="ghost" size="small" @click="showAllFeatures = !showAllFeatures">
                                {{ showAllFeatures ? 'Show Less' : 'Show More' }}
                            </BaseButton>
                        </div>
                    </div>

                    <div v-else class="plan-card__content">
                        <StatusIndicator status="caution" title="Editing Plan"
                            description="Modify plan details and features" />

                        <BaseFormField v-model="plan.name" :label="$t('planName')" :placeholder="$t('enterPlanName')"
                            :error="plan.name.length === 0 ? 'Plan name is required' : null" />

                        <div class="plan-card__price-inputs">
                            <BaseFormField v-model.number="plan.price" type="number" :label="$t('monthlyPrice')"
                                placeholder="0.00" :error="plan.price < 0 ? 'Price must be non-negative' : null" />
                            <BaseFormField v-model.number="plan.yearlyPrice" type="number" :label="$t('yearlyPrice')"
                                placeholder="0.00"
                                :error="plan.yearlyPrice < 0 ? 'Price must be non-negative' : null" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">{{ $t('features') }}</label>
                            <select v-model="plan.features" multiple class="form-control" style="min-height: 150px;">
                                <option v-for="feature in featureOptions" :key="feature.id" :value="feature.id">
                                    {{ feature.name }}
                                </option>
                            </select>
                            <small class="form-text text-muted">Select multiple features for this plan (Hold
                                Ctrl/Cmd)</small>
                        </div>
                    </div>

                    <template #footer>
                        <div class="plan-card__actions">
                            <BaseButton v-if="!plan.isEditing" variant="primary" size="small"
                                @click="startEditing(plan)" left-icon="bi bi-pencil">
                                {{ $t('edit') }}
                            </BaseButton>
                            <BaseButton v-if="!plan.isEditing" variant="danger" size="small"
                                @click="removePlan(idx, plan)" left-icon="bi bi-trash">
                                {{ $t('remove') }}
                            </BaseButton>
                            <BaseButton v-if="plan.isEditing" variant="primary" size="small" @click="savePlan(plan)"
                                left-icon="bi bi-save">
                                {{ $t('save') }}
                            </BaseButton>
                            <BaseButton v-if="plan.isEditing" variant="secondary" size="small"
                                @click="cancelEditing(plan)" left-icon="bi bi-x">
                                {{ $t('cancel') }}
                            </BaseButton>
                        </div>
                    </template>
                </BaseCard>

                <!-- Add New Plan Button -->
                <BaseCard v-if="!showNewPlanCard"
                    class="subscription-plans-admin__card subscription-plans-admin__add-card" variant="default">
                    <div class="plan-card__add-content">
                        <BaseButton variant="primary" size="large" @click="showNewPlanCard = true"
                            left-icon="bi bi-plus-lg">
                            {{ $t('addPlan') }}
                        </BaseButton>
                    </div>
                </BaseCard>
            </div>
        </BasePanel>

        <!-- Delete Confirmation Modal -->
        <BaseConfirmationModal :visible="showDeleteConfirmation" :title="$t('confirmDelete')"
            :message="$t('deletePlanConfirmation', { planName: planToDelete?.name })" :show-danger-button="true"
            danger-text="Delete" danger-icon="bi bi-trash" @confirm="confirmDelete" @cancel="cancelDelete"
            @close="cancelDelete" />
    </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import SubscriptionPlansController from "@/controllers/subscription_plans/subscription_plans_controller";
import BaseCard from "@/components/ui/BaseCard.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseFormField from "@/components/ui/BaseFormField.vue";
import BasePanel from "@/components/ui/BasePanel.vue";
import StatusIndicator from "@/components/ui/StatusIndicator.vue";
import BaseConfirmationModal from "@/components/ui/BaseConfirmationModal.vue";

const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

// Placeholder: List of all available features
const featureOptions = [
    // Core Features
    {
        id: 'free_surveys',
        name: 'Free Surveys',
        description: 'Number of free surveys included in the plan',
        category: 'Core',
        valueType: 'number',
        unit: 'surveys',
    },
    {
        id: 'storage_space',
        name: 'Storage Space',
        description: 'Available storage space for surveys and reports',
        category: 'Core',
        valueType: 'number',
        unit: 'GB',
    },
    {
        id: 'survey_scheduling',
        name: 'Survey Scheduling',
        description: 'Schedule and plan survey routes in advance',
        category: 'Core',
    },
    {
        id: 'route_optimization',
        name: 'Route Optimization',
        description: 'AI-powered route optimization for efficiency',
        category: 'Core',
    },
    {
        id: 'multi_user',
        name: 'Multi-User Access',
        description: 'Multiple user accounts with role-based permissions',
        category: 'Core',
    },
    {
        id: 'mobile_app',
        name: 'Mobile App Access',
        description: 'Native mobile app for field operations',
        category: 'Core',
    },
    // Data Management
    {
        id: 'image_timestamp',
        name: 'Image Timestamp & GPS',
        description: 'Automatic GPS tagging and timestamping',
        category: 'Data',
    },
    {
        id: 'export_options',
        name: 'Export Options (PDF, KML)',
        description: 'Export data in PDF and KML formats',
        category: 'Data',
    },
    {
        id: 'data_encryption',
        name: 'Data Encryption',
        description: 'Enterprise-grade data encryption and security',
        category: 'Data',
    },
    {
        id: 'backup_restore',
        name: 'Backup & Restore',
        description: 'Automated data backup and restore capabilities',
        category: 'Data',
    },
    {
        id: 'api_access',
        name: 'API Access',
        description: 'RESTful API access for custom integrations',
        category: 'Data',
    },
    // Reports & Templates
    {
        id: 'mobile_report_editing',
        name: 'Editing Reports (On Mobile)',
        description: 'Edit reports directly from mobile devices',
        category: 'Reports',
    },
    {
        id: 'local_mobile_reports',
        name: 'Generating Local Reports (On Mobile)',
        description: 'Generate reports locally on mobile devices',
        category: 'Reports',
    },
    {
        id: 'report_generation',
        name: 'Generating Reports',
        description: 'Create and generate comprehensive reports',
        category: 'Reports',
    },
    {
        id: 'custom_templates',
        name: 'Custom Templates',
        description: 'Create and save custom report templates',
        category: 'Templates',
    },
    {
        id: 'template_library',
        name: 'Template Library',
        description: 'Access to pre-built template library',
        category: 'Templates',
    },
    // Customization
    {
        id: 'theme_modes',
        name: 'Dark/Light Modes',
        description: 'Switch between dark and light themes',
        category: 'Customization',
    },
    {
        id: 'languages',
        name: 'Languages',
        description: 'Multiple language support',
        category: 'Customization',
        valueType: 'number',
        unit: 'languages',
    },
    {
        id: 'whitelabel',
        name: 'Whitelabel Portal',
        description: 'Custom branding and white-label options',
        category: 'Customization',
    },
    {
        id: 'custom_fields',
        name: 'Custom Fields',
        description: 'Add custom data fields and attributes',
        category: 'Customization',
    },
    {
        id: 'template_builder',
        name: 'Template Builder',
        description: 'Create and save custom templates',
        category: 'Customization',
    },
    // Support
    {
        id: 'priority_support',
        name: 'Priority Support',
        description: '24/7 priority customer support',
        category: 'Support',
    },
    {
        id: 'training_resources',
        name: 'Training Resources',
        description: 'Access to training materials and webinars',
        category: 'Support',
    },
    {
        id: 'dedicated_manager',
        name: 'Dedicated Account Manager',
        description: 'Personal account manager for enterprise clients',
        category: 'Support',
    },
];

// Free plan is fixed
const freePlan = reactive({
    name: 'Basic',
    monthlyPrice: 29,
    yearlyPrice: 300,
    billing: 'monthly',
    features: {
        free_surveys: true,
        storage_space: true,
        manual_routes: true,
        survey_scheduling: true,
        route_optimization: false,
        multi_user: false,
        mobile_app: false,
        image_timestamp: true,
        export_options: false,
        data_encryption: false,
        backup_restore: false,
        api_access: false,
        mobile_report_editing: true,
        local_mobile_reports: true,
        report_generation: true,
        custom_templates: false,
        template_library: false,
        theme_modes: true,
        languages: true,
        whitelabel: false,
        custom_fields: false,
        template_builder: false,
        priority_support: false,
        training_resources: false,
        dedicated_manager: false,
    },
});

// Admin-created plans
const plans = ref([
    // Example:
    // { id: uuidv4(), name: 'Pro', monthlyPrice: 10, yearlyPrice: 100, features: ['priority_support', 'analytics'] }
]);

const showNewPlanCard = ref(false);
const newPlan = reactive({
    name: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [],
});

// Add these refs for delete confirmation
const showDeleteConfirmation = ref(false);
const planToDelete = ref(null);

// Placeholder API functions
async function apiAddPlan(plan) {
    // console.log(plan);
    // Simulate API call
    // return new Promise(resolve => setTimeout(() => resolve({ result: true, data: { ...plan } }), 500));

    setGlobalLoading(true);

    try {
        const res = await SubscriptionPlansController.addSubscriptionPlan({
            Name: plan.name,
            Description: "",
            Price: plan.monthlyPrice,
            YearlyPrice: plan.yearlyPrice,
            Duration: 30,
            Features: JSON.stringify(plan.features),
        });

        if (res.result) {
            showMessage({ status: 'success', message: res.message });

            plans.value.push(res.data);
            resetNewPlan();
            showNewPlanCard.value = false;
        }
        else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: 'error', message: error });
    }

    setGlobalLoading(false);
}
async function apiRemovePlan(planId) {
    setGlobalLoading(true);

    try {
        const res = await SubscriptionPlansController.removeSubscriptionPlan(planId);

        if (res.result) {
            showMessage({ status: 'success', message: res.message });
            plans.value = plans.value.filter(e => e.id !== planId);
        }
        else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.log(error);
    }
    setGlobalLoading(false);
}

async function saveNewPlan() {
    // Validate
    if (!newPlan.name || newPlan.monthlyPrice < 0 || newPlan.yearlyPrice < 0) {
        alert('Please fill all required fields and ensure prices are non-negative.');
        return;
    }
    const planToAdd = { ...newPlan, id: uuidv4() };
    await apiAddPlan(planToAdd);
    // const res = await apiAddPlan(planToAdd);
    // if (res.result) {
    //     plans.value.push(res.data);
    //     resetNewPlan();
    //     showNewPlanCard.value = false;
    // } else {
    //     alert('Failed to add plan (API placeholder)');
    // }
}

function cancelNewPlan() {
    resetNewPlan();
    showNewPlanCard.value = false;
}

function resetNewPlan() {
    newPlan.name = '';
    newPlan.monthlyPrice = 0;
    newPlan.yearlyPrice = 0;
    newPlan.features = [];
}

async function removePlan(idx, plan) {
    planToDelete.value = plan;
    showDeleteConfirmation.value = true;
}

// Show more/less functionality for features
const showAllFeatures = ref(false);

// Edit functionality for plans
function startEditing(plan) {
    plan.isEditing = true;
}

function cancelEditing(plan) {
    plan.isEditing = false;
}

async function savePlan(plan) {
    // Validate
    if (!plan.name || plan.monthlyPrice < 0 || plan.yearlyPrice < 0) {
        alert('Please fill all required fields and ensure prices are non-negative.');
        return;
    }
    // Simulate API call to save plan

    setGlobalLoading(true);
    try {
        const res = await SubscriptionPlansController.updateSubscriptionPlan({
            Id: plan.id,
            Name: plan.name,
            Description: "",
            Price: plan.price,
            YearlyPrice: plan.yearlyPrice,
            Features: JSON.stringify(plan.features),
            Duration: 30,
        });

        if (res.result) {
            showMessage({ status: 'success', message: res.message });
            plan.isEditing = false;
            await loadPlans();
        }
        else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.log(error);
    }
    setGlobalLoading(false);

    // const res = await apiAddPlan(plan);
    // if (res.result) {
    //     plan.isEditing = false;
    //     // Optionally show a success message
    // } else {
    //     alert('Failed to save plan (API placeholder)');
    // }
}

const loadPlans = async () => {
    try {
        const res = await SubscriptionPlansController.getSubscriptionPlans();

        if (res.result) {
            plans.value = res.data.map(e => {
                // console.log(e);
                return {
                    ...e,
                    features: JSON.parse(e.features),
                };
            });
        }
        // else {
        //     showMessage({ status: 'error', message: res.message });
        // }
    } catch (error) {
        console.log(error);
    }
}

const getData = async () => {
    setGlobalLoading(true);

    try {
        await loadPlans();
    } catch (error) {
        console.log(error);
    }

    setGlobalLoading(false);
}

// Add these new functions
async function confirmDelete() {
    if (planToDelete.value) {
        await apiRemovePlan(planToDelete.value.id);
        showDeleteConfirmation.value = false;
        planToDelete.value = null;
    }
}

function cancelDelete() {
    showDeleteConfirmation.value = false;
    planToDelete.value = null;
}

onMounted(async () => {
    getData();
});
</script>

<style scoped>
.subscription-plans-admin {
    height: 93vh;
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.subscription-plans-admin .base-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.subscription-plans-admin__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--spacing-lg);
    padding: var(--spacing-md);
    min-height: 0;
}

.subscription-plans-admin__card {
    min-height: 400px;
}

.subscription-plans-admin__add-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}

.plan-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.plan-card__title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0;
}

.plan-card__badge {
    background: var(--success);
    color: white;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
}

.plan-card__content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.plan-card__content .status-indicator {
    margin-bottom: var(--spacing-sm);
}

.plan-card__price {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--bg-elevated);
    border-radius: var(--radius-lg);
}

.plan-card__price-label {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
}

.plan-card__price-value {
    font-weight: var(--font-weight-semibold);
    color: var(--success);
    font-size: var(--font-size-lg);
}

.plan-card__price-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
}

.plan-card__features {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.plan-card__features-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0;
}

.plan-card__features-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.plan-card__feature--disabled {
    opacity: 0.5;
}

.plan-card__feature-icon--enabled {
    color: var(--success);
    margin-right: var(--spacing-xs);
}

.plan-card__feature-icon--disabled {
    color: var(--error);
    margin-right: var(--spacing-xs);
}

.plan-card__feature-text {
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}

.plan-card__actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
}

.plan-card__add-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
}

/* Form styling for features selection */
.form-group {
    margin-bottom: var(--spacing-md);
}

.form-label {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    letter-spacing: var(--letter-spacing-wide);
    margin-bottom: var(--spacing-xs);
    display: block;
}

.form-control {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-base);
    color: var(--text-primary);
    transition: all var(--transition-normal);
    outline: none;
    width: 100%;
}

.form-control:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgb(0 167 225 / 10%);
}

.form-text {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
}

/* Responsive Design */
@media (width <=768px) {
    .subscription-plans-admin {
        padding: var(--spacing-sm);
        height: 100vh;
    }

    .subscription-plans-admin__grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
        padding: var(--spacing-sm);
    }


    .plan-card__price-inputs {
        grid-template-columns: 1fr;
    }

    .plan-card__actions {
        flex-direction: column;
    }
}

@media (width <=480px) {
    .subscription-plans-admin {
        padding: var(--spacing-xs);
        height: 100vh;
    }

    .plan-card__header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
    }
}
</style>
