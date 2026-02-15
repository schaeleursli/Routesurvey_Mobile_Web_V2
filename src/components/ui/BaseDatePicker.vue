<template>
    <div class="base-date-picker" :class="{ 'base-date-picker--open': isOpen }">
        <label v-if="label" class="base-date-picker__label text-left" :for="fieldId">
            {{ label }}
        </label>
        <div class="base-date-picker__input-wrapper" ref="inputWrapper">
            <input :id="fieldId" type="text" :value="displayValue" :placeholder="placeholder" :disabled="disabled"
                :required="required" :class="[
                    'base-date-picker__input',
                    { 'base-date-picker__input--readonly': readonly },
                    { 'base-date-picker__input--disabled': disabled },
                    { 'base-date-picker__input--error': error }
                ]" @click="toggleCalendar" @focus="toggleCalendar" @blur="handleBlur" readonly />
            <button type="button" class="base-date-picker__icon-button" @click="toggleCalendar" :disabled="disabled"
                tabindex="-1">
                <PhCalendarBlank :size="16" />
            </button>
            <div v-if="isOpen && !disabled" class="base-date-picker__calendar" @click.stop>
                <div class="base-date-picker__calendar-header">
                    <button type="button" class="base-date-picker__nav-button" @click="previousMonth"
                        :disabled="isMinMonth">
                        <PhCaretLeft :size="14" />
                    </button>
                    <div class="base-date-picker__month-year">
                        {{ currentMonthYear }}
                    </div>
                    <button type="button" class="base-date-picker__nav-button" @click="nextMonth"
                        :disabled="isMaxMonth">
                        <PhCaretRight :size="14" />
                    </button>
                </div>
                <div class="base-date-picker__weekdays">
                    <div v-for="day in weekDays" :key="day" class="base-date-picker__weekday">
                        {{ day }}
                    </div>
                </div>
                <div class="base-date-picker__days">
                    <div v-for="day in calendarDays" :key="day.key" :class="[
                        'base-date-picker__day',
                        {
                            'base-date-picker__day--other-month': day.isOtherMonth,
                            'base-date-picker__day--today': day.isToday,
                            'base-date-picker__day--selected': day.isSelected,
                            'base-date-picker__day--disabled': day.isDisabled
                        }
                    ]" @click="selectDate(day)">
                        {{ day.day }}
                    </div>
                </div>
                <div class="base-date-picker__calendar-footer">
                    <button type="button" class="base-date-picker__today-button" @click="selectToday">
                        {{ t('today') }}
                    </button>
                    <button type="button" class="base-date-picker__clear-button" @click="clearDate" v-if="modelValue">
                        {{ t('clear') }}
                    </button>
                </div>
            </div>
        </div>
        <div v-if="error" class="base-date-picker__error">
            {{ error }}
        </div>
        <div v-if="help" class="base-date-picker__help">
            {{ help }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { PhCalendarBlank, PhCaretLeft, PhCaretRight } from '@phosphor-icons/vue';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: null
    },
    placeholder: {
        type: String,
        default: null
    },
    readonly: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    },
    help: {
        type: String,
        default: null
    },
    min: {
        type: String,
        default: null
    },
    max: {
        type: String,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const fieldId = computed(() => `date-picker-${Math.random().toString(36).substr(2, 9)}`)
const inputWrapper = ref(null)
const isOpen = ref(false)
const currentDate = ref(new Date())

// Week days based on locale
const weekDays = computed(() => {
    const days = []
    const date = new Date(2024, 0, 1) // Start from a Monday
    for (let i = 0; i < 7; i++) {
        const day = new Date(date)
        day.setDate(date.getDate() + i)
        const dayName = day.toLocaleDateString(locale.value, { weekday: 'short' })
        days.push(dayName)
    }
    return days
})

// Get current month and year display
const currentMonthYear = computed(() => {
    return currentDate.value.toLocaleDateString(locale.value, {
        month: 'long',
        year: 'numeric'
    })
})

// Check if we're at minimum month
const isMinMonth = computed(() => {
    if (!props.min) return false
    const minDate = new Date(props.min)
    return currentDate.value.getFullYear() === minDate.getFullYear() &&
        currentDate.value.getMonth() === minDate.getMonth()
})

// Check if we're at maximum month
const isMaxMonth = computed(() => {
    if (!props.max) return false
    const maxDate = new Date(props.max)
    return currentDate.value.getFullYear() === maxDate.getFullYear() &&
        currentDate.value.getMonth() === maxDate.getMonth()
})

// Format date for display
const displayValue = computed(() => {
    if (!props.modelValue) return ''
    const date = new Date(props.modelValue)
    if (isNaN(date.getTime())) return props.modelValue
    return date.toLocaleDateString(locale.value, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
})

// Generate calendar days
const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay()

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Previous month's last days
    const prevMonth = new Date(year, month, 0)
    const daysInPrevMonth = prevMonth.getDate()

    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get selected date
    let selectedDate = null
    if (props.modelValue) {
        selectedDate = new Date(props.modelValue)
        selectedDate.setHours(0, 0, 0, 0)
    }

    // Previous month days
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    for (let i = startOffset - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i
        const date = new Date(year, month - 1, day)
        days.push({
            key: `prev-${day}`,
            day: day,
            date: date,
            isOtherMonth: true,
            isToday: false,
            isSelected: false,
            isDisabled: isDateDisabled(date)
        })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateOnly = new Date(date)
        dateOnly.setHours(0, 0, 0, 0)

        days.push({
            key: `current-${day}`,
            day: day,
            date: date,
            isOtherMonth: false,
            isToday: dateOnly.getTime() === today.getTime(),
            isSelected: selectedDate && dateOnly.getTime() === selectedDate.getTime(),
            isDisabled: isDateDisabled(date)
        })
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day)
        days.push({
            key: `next-${day}`,
            day: day,
            date: date,
            isOtherMonth: true,
            isToday: false,
            isSelected: false,
            isDisabled: isDateDisabled(date)
        })
    }

    return days
})

// Check if date is disabled
const isDateDisabled = (date) => {
    if (props.min) {
        const minDate = new Date(props.min)
        minDate.setHours(0, 0, 0, 0)
        if (date < minDate) return true
    }
    if (props.max) {
        const maxDate = new Date(props.max)
        maxDate.setHours(23, 59, 59, 999)
        if (date > maxDate) return true
    }
    return false
}

// Toggle calendar
const toggleCalendar = () => {
    if (props.disabled || props.readonly) return
    isOpen.value = !isOpen.value
}

// Navigate months
const previousMonth = () => {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentDate.value = newDate
}

const nextMonth = () => {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentDate.value = newDate
}

// Select date
const selectDate = (day) => {
    if (day.isDisabled || day.isOtherMonth) return

    const dateStr = formatDateForInput(day.date)
    emit('update:modelValue', dateStr)
    isOpen.value = false
}

// Select today
const selectToday = () => {
    const today = new Date()
    if (!isDateDisabled(today)) {
        const dateStr = formatDateForInput(today)
        emit('update:modelValue', dateStr)
        isOpen.value = false
    }
}

// Clear date
const clearDate = () => {
    emit('update:modelValue', '')
    isOpen.value = false
}

// Format date for input (YYYY-MM-DD)
const formatDateForInput = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Handle blur
const handleBlur = (event) => {
    // Delay closing to allow click events on calendar
    setTimeout(() => {
        if (!inputWrapper.value?.contains(document.activeElement)) {
            isOpen.value = false
        }
    }, 200)
    emit('blur', event)
}

// Update current date when modelValue changes
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        const date = new Date(newValue)
        if (!isNaN(date.getTime())) {
            currentDate.value = date
        }
    }
}, { immediate: true })

// Close calendar when clicking outside
const handleClickOutside = (event) => {
    if (inputWrapper.value && !inputWrapper.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.base-date-picker {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.base-date-picker__label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 13px;
    letter-spacing: 0.2%;
    margin-bottom: 0.375rem;
}

.base-date-picker__input-wrapper {
    position: relative;
    width: 100%;
}

.base-date-picker__input {
    width: 100%;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 14px;
    font-weight: 400;
    background: var(--bg-surface);
    color: var(--text-primary);
    transition: all 0.2s ease;
    cursor: pointer;
}

.base-date-picker__input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgb(0 167 225 / 10%);
}

.base-date-picker__input--readonly {
    color: var(--text-secondary);
    background: var(--bg-elevated);
    cursor: not-allowed;
}

.base-date-picker__input--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--bg-elevated);
}

.base-date-picker__input--error {
    border-color: var(--error, var(--error));
}

.base-date-picker__input--error:focus {
    border-color: var(--error, var(--error));
    box-shadow: 0 0 0 3px rgb(220 53 69 / 10%);
}

.base-date-picker__icon-button {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
    z-index: 1;
}

.base-date-picker__icon-button:hover:not(:disabled) {
    color: var(--accent);
}

.base-date-picker__icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.base-date-picker__icon-button i {
    font-size: 1rem;
}

.base-date-picker__calendar {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    z-index: 1000;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    padding: 1rem;
    min-width: 280px;
    animation: slideDown 0.2s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.base-date-picker__calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
}

.base-date-picker__nav-button {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.base-date-picker__nav-button:hover:not(:disabled) {
    background: var(--bg-elevated);
    color: var(--accent);
}

.base-date-picker__nav-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.base-date-picker__nav-button i {
    font-size: 0.875rem;
}

.base-date-picker__month-year {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-primary);
    text-transform: capitalize;
}

.base-date-picker__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.base-date-picker__weekday {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 0.5rem 0;
    text-transform: uppercase;
}

.base-date-picker__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.75rem;
}

.base-date-picker__day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-primary);
    background: transparent;
}

.base-date-picker__day:hover:not(.base-date-picker__day--disabled, .base-date-picker__day--other-month) {
    background: var(--bg-elevated);
    color: var(--accent);
}

.base-date-picker__day--other-month {
    color: var(--text-secondary);
    opacity: 0.4;
}

.base-date-picker__day--today {
    font-weight: 600;
    border: 1px solid var(--accent);
}

.base-date-picker__day--selected {
    background: var(--accent);
    color: white;
    font-weight: 600;
}

.base-date-picker__day--selected:hover {
    background: var(--accent);
    opacity: 0.9;
}

.base-date-picker__day--disabled {
    opacity: 0.3;
    cursor: not-allowed;
    color: var(--text-secondary);
}

.base-date-picker__day--disabled:hover {
    background: transparent;
}

.base-date-picker__calendar-footer {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
}

.base-date-picker__today-button,
.base-date-picker__clear-button {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.base-date-picker__today-button:hover,
.base-date-picker__clear-button:hover {
    background: var(--bg-elevated);
    border-color: var(--accent);
    color: var(--accent);
}

.base-date-picker__error {
    color: var(--error, var(--error));
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 0.25rem;
}

.base-date-picker__help {
    color: var(--text-secondary);
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

/* Responsive adjustments */
@media (width <= 768px) {
    .base-date-picker__calendar {
        min-width: 260px;
        padding: 0.75rem;
    }

    .base-date-picker__day {
        font-size: 0.75rem;
    }
}
</style>
