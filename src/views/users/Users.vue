<template>
    <div class="users-admin container py-4">
        <h2 class="mb-4">User Management</h2>
        <BaseCard class="mb-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3">
                <div class="d-flex flex-wrap gap-2 align-items-center">
                    <BaseButton variant="primary" @click="showAddModal = true" left-icon="bi bi-plus-lg">
                        {{ $t('addUser') }}
                    </BaseButton>
                </div>
                <div class="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
                    <input v-model="searchQuery" :placeholder="$t('searchUsers')" class="form-control form-control-sm me-2"
                        style="max-width: 200px;" />
                    <select v-model="filterType" class="form-select form-select-sm" style="max-width: 150px;">
                        <option v-for="opt in userTypeFilterOptions" :key="opt.value" :value="opt.value">
                            {{ opt.text }}
                        </option>
                    </select>
                </div>
                <div class="text-muted small mt-2 mt-md-0">{{ $t('totalUsers') }}: {{ filteredUsers.length }}</div>
            </div>

            <BaseTable :items="filteredUsers" :columns="fields" :sort-column="sortBy"
                :sort-direction="sortDesc ? 'desc' : 'asc'" @sort="handleSort">
                <template #cell-actions="{ index }">
                    <BaseButton size="small" variant="danger" class="ms-2" @click="confirmRemoveUser(index)"
                        left-icon="bi bi-trash">
                        {{ $t('remove') }}
                    </BaseButton>
                </template>
            </BaseTable>
        </BaseCard>

        <!-- Add User Modal -->
        <!-- Add User Modal -->
        <BaseModal v-model:visible="showAddModal" :title="$t('addUser')">
            <form @submit.prevent="saveUser">
                <div class="row">
                    <div class="col-md-6">
                        <BaseFormField label="First Name" v-model="userForm.firstName" required />
                    </div>
                    <div class="col-md-6">
                        <BaseFormField label="Last Name" v-model="userForm.lastName" required />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <BaseFormField label="Email" v-model="userForm.email" type="email" required />
                    </div>
                    <div class="col-md-6">
                        <BaseFormField label="Password" v-model="userForm.password" type="password" required />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <BaseDropdown label="User Type" v-model="userForm.type" :options="baseUserTypes" required />
                    </div>
                    <div class="col-md-6">
                        <BaseFormField label="Mobile Number" v-model="userForm.mobileNumber" />
                    </div>
                </div>
                <BaseFormField label="Company Name" v-model="userForm.companyName" />
                <BaseFormField label="Company Website" v-model="userForm.companyWebsite" />
                <div class="row">
                    <div class="col-md-6">
                        <BaseFormField label="Street" v-model="userForm.companyADStreet" />
                    </div>
                    <div class="col-md-6">
                        <BaseFormField label="City" v-model="userForm.companyADCity" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <BaseFormField label="State" v-model="userForm.companyADState" />
                    </div>
                    <div class="col-md-4">
                        <BaseFormField label="Zipcode" v-model="userForm.companyADZipcode" />
                    </div>
                    <div class="col-md-4">
                        <BaseFormField label="Country" v-model="userForm.companyADCountry" />
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Disclaimer</label>
                    <textarea v-model="userForm.disclaimer" class="form-control" rows="2"></textarea>
                </div>
            </form>
            <template #footer>
                <BaseButton variant="secondary" @click="resetUserForm; showAddModal = false;">{{ $t('cancel') }}
                </BaseButton>
                <BaseButton variant="primary" @click="saveUser">{{ $t('add') }}</BaseButton>
            </template>
        </BaseModal>

        <!-- Remove Confirmation Modal -->
        <BaseModal v-model:visible="showRemoveModal" :title="$t('confirmRemove')" size="small">
            <p>{{ $t('confirmRemoveMessage') }} <strong>{{ users[removingIndex]?.firstName }} {{
                users[removingIndex]?.lastName
            }}</strong>?</p>
            <template #footer>
                <BaseButton variant="secondary" @click="cancelRemoveUser">{{ $t('cancel') }}</BaseButton>
                <BaseButton variant="danger" @click="removeUser">{{ $t('remove') }}</BaseButton>
            </template>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { BaseCard, BaseButton, BaseTable, BaseModal, BaseFormField, BaseDropdown } from '@/components/ui';

const authStore = useAuthStore();

const setGlobalLoading = inject('setGlobalLoading');
const showMessage = inject('showMessage');

const users = ref([]);
const fields = [
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'type', label: 'User Type', sortable: true },
    { key: 'mobileNumber', label: 'Mobile', sortable: true },
    { key: 'companyName', label: 'Company', sortable: true },
    { key: 'actions', label: 'Actions' }
];
const userTypes = ['User', 'Manager'];
const userTypeFilterOptions = [
    { value: '', text: 'All Types' },
    ...userTypes.map(type => ({ value: type, text: type }))
];

const showAddModal = ref(false);
const showRemoveModal = ref(false);
const removingIndex = ref(null);
const searchQuery = ref('');
const filterType = ref('');

const sortBy = ref('firstName');
const sortDesc = ref(false);

const userForm = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    type: 'User',
    mobileNumber: '',
    companyName: '',
    companyWebsite: '',
    companyADStreet: '',
    companyADCity: '',
    companyADState: '',
    companyADZipcode: '',
    companyADCountry: '',
    disclaimer: '',
});

const filteredUsers = computed(() => {
    let filtered = users.value;
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        filtered = filtered.filter(u =>
            (u.firstName && u.firstName.toLowerCase().includes(q)) ||
            (u.lastName && u.lastName.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.companyName && u.companyName.toLowerCase().includes(q))
        );
    }
    if (filterType.value) {
        filtered = filtered.filter(u => u.type === filterType.value);
    }
    // Sorting
    if (sortBy.value) {
        filtered = [...filtered].sort((a, b) => {
            const aVal = a[sortBy.value] || '';
            const bVal = b[sortBy.value] || '';
            if (aVal < bVal) return sortDesc.value ? 1 : -1;
            if (aVal > bVal) return sortDesc.value ? -1 : 1;
            return 0;
        });
    }
    return filtered;
});

function resetUserForm() {
    Object.assign(userForm, {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        type: 'User',
        mobileNumber: '',
        companyName: '',
        companyWebsite: '',
        companyADStreet: '',
        companyADCity: '',
        companyADState: '',
        companyADZipcode: '',
        companyADCountry: '',
        disclaimer: '',
    });
}

const saveUser = async () => {
    setGlobalLoading(true);
    try {
        const res = await authStore.addUser({
            FirstName: userForm.firstName,
            LastName: userForm.lastName,
            Email: userForm.email,
            Password: userForm.password,
            UserType: userForm.type,
            MobileNumber: userForm.mobileNumber,
            CompanyName: userForm.companyName,
            CompanyWebsite: userForm.companyWebsite,
            CompanyADStreet: userForm.companyADStreet,
            CompanyADCity: userForm.companyADCity,
            CompanyADState: userForm.companyADState,
            CompanyADZipcode: userForm.companyADZipcode,
            CompanyADCountry: userForm.companyADCountry,
            Disclaimer: userForm.disclaimer,
        });
        if (res.result) {
            showMessage({ status: 'success', message: res.message });
            showAddModal.value = false;
            resetUserForm();
            await loadUsers();
        } else {
            showMessage({ status: 'error', message: res.message });
        }
    } catch (error) {
        console.log(error);
        showMessage({ status: 'error', message: error });
    }
    setGlobalLoading(false);
};

function confirmRemoveUser(index) {
    removingIndex.value = index;
    showRemoveModal.value = true;
}

const removeUser = async () => {
    setGlobalLoading(true);
    try {
        if (removingIndex.value !== null) {
            users.value.splice(removingIndex.value, 1);
            removingIndex.value = null;
        }
        showRemoveModal.value = false;
    } catch (error) {
        console.log(error);
    }
    setGlobalLoading(false);
};

function cancelRemoveUser() {
    removingIndex.value = null;
    showRemoveModal.value = false;
}

const loadUsers = async () => {
    try {
        const res = await authStore.getUsers();
        // console.log(res);
        if (res.result) {
            users.value = res.data;
        }
    } catch (error) {
        console.log(error);
    }
};

const getData = async () => {
    setGlobalLoading(true);
    try {
        await loadUsers();
    } catch (error) {
        console.log(error);
    }
    setGlobalLoading(false);
};

const baseUserTypes = computed(() => {
    return userTypes.map(type => ({ label: type, value: type }));
});

function handleSort(key) {
    if (sortBy.value === key) {
        sortDesc.value = !sortDesc.value;
    } else {
        sortBy.value = key;
        sortDesc.value = false;
    }
}

onMounted(async () => {
    getData();
});
</script>

<style scoped>
.users-admin {
    max-width: 1200px;
}
</style>
