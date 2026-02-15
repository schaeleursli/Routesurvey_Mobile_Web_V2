/**
 * Calculation Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { CalcJob, CalculationRequest, AxleLoadResult } from '@/types/calc'
import { useAppStore } from './app'

export const useCalcStore = defineStore('calc', () => {
    const appStore = useAppStore()

    // State
    const jobs = ref<CalcJob[]>([])
    const activeJob = ref<CalcJob | null>(null)
    const latestAxleLoad = ref<AxleLoadResult | null>(null)
    const loading = ref(false)

    // Actions
    async function runCalculation(request: CalculationRequest) {
        loading.value = true
        try {
            const job = await api.runCalculation(request)
            jobs.value.unshift(job)
            activeJob.value = job

            // If axle load, extract results
            if (job.calc_type === 'axle_load_summary' && job.results) {
                latestAxleLoad.value = job.results as AxleLoadResult
            }

            appStore.showToast('Calculation completed', 'success')
            return job
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Calculation failed')
            throw error
        } finally {
            loading.value = false
        }
    }

    async function fetchJobs(projectId: string) {
        loading.value = true
        try {
            jobs.value = await api.getCalculationJobs(projectId)
        } catch (error) {
            appStore.setError(error instanceof Error ? error.message : 'Failed to load jobs')
        } finally {
            loading.value = false
        }
    }

    async function pollJob(jobId: string) {
        try {
            const job = await api.getCalculationJob(jobId)
            const index = jobs.value.findIndex(j => j.id === jobId)
            if (index !== -1) {
                jobs.value[index] = job
            }
            if (activeJob.value?.id === jobId) {
                activeJob.value = job
            }
            return job
        } catch (error) {
            console.error('Poll failed:', error)
        }
    }

    return {
        // State
        jobs,
        activeJob,
        latestAxleLoad,
        loading,
        // Actions
        runCalculation,
        fetchJobs,
        pollJob,
    }
})
